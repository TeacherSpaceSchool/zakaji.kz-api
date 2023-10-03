const { isMainThread } = require('worker_threads');
const connectDB = require('../models/index');
const { reductionOutAdsXML, setSingleOutXML } = require('../module/singleOutXML');
const { checkAdss } = require('../graphql/ads');
const Organization = require('../models/organization');
const Invoice = require('../models/invoice');
const Ads = require('../models/ads');
const Order = require('../models/order');
const cron = require('node-cron');
const ModelsError = require('../models/error');
const SingleOutXML = require('../models/singleOutXML');
const SingleOutXMLReturned = require('../models/singleOutXMLReturned');
const OutXMLShoro = require('../models/integrate/shoro/outXMLShoro');
const OutXMLReturnedShoro = require('../models/integrate/shoro/outXMLReturnedShoro');
const HistoryOrder = require('../models/historyOrder');
const { pubsub } = require('../graphql/index');
const RELOAD_ORDER = 'RELOAD_ORDER';

connectDB.connect()
if(!isMainThread) {
    cron.schedule('1 3 * * *', async() => {
        try {
            //автоприемом только за сегодня
            const dateEnd = new Date()
            dateEnd.setHours(3, 0, 0, 0)
            const dateStart = new Date(dateEnd)
            dateStart.setDate(dateStart.getDate() - 1)
            //несинхронизованные заказы
            let organizations = await Organization.find({pass: {$nin: ['', null]}}).distinct('_id').lean()
            const unsynces = await Invoice.find({
                $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}],
                sync: {$nin: [1, 2]},
                cancelClient: null,
                cancelForwarder: null,
                del: {$ne: 'deleted'},
                taken: true,
                organization: {$in: organizations},
            })
                .select('_id orders')
                .lean()
            let unsyncorders = [], unsyncinvoices = []
            for(let i = 0; i<unsynces.length;i++) {
                unsyncorders = [...unsyncorders, ...unsynces[i].orders]
                unsyncinvoices = [...unsyncinvoices, unsynces[i]._id]
            }
            await Order.updateMany({_id: {$in: unsyncorders}}, {status: 'обработка'})
            await Invoice.updateMany({_id: {$in: unsyncinvoices}}, {
                taken: false,
                cancelClient: null,
                cancelForwarder: null,
            })
            //автоприем заказов
            organizations = await Organization.find({autoAcceptNight: true}).distinct('_id').lean()
            let invoices = await Invoice.find({
                del: {$ne: 'deleted'},
                taken: {$ne: true},
                cancelClient: null,
                cancelForwarder: null,
                $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}],
                organization: {$in: organizations},
            })
                //.select('client organization orders dateDelivery paymentMethod number _id inv')
                .populate({
                    path: 'client',
                    //  select: '_id'
                })
                .populate({
                    path: 'organization',
                    //   select: '_id pass'
                })
                .populate({
                    path: 'orders',
                    //  select: '_id item count returned allPrice ',
                    populate: {
                        path: 'item',
                        //    select: '_id priotiry packaging'
                    }
                })
                .populate({path: 'agent'})
                .populate({path: 'provider'})
                .populate({path: 'sale'})
                .populate({path: 'forwarder'})
            for(let i = 0; i<invoices.length;i++) {
                invoices[i].taken = true
                await Order.updateMany({_id: {$in: invoices[i].orders.map(element=>element._id)}}, {status: 'принят'})
                invoices[i].adss = await checkAdss(invoices[i])
                if (invoices[i].organization.pass && invoices[i].organization.pass.length) {
                    invoices[i].sync = await setSingleOutXML(invoices[i])
                }
                ///заглушка
                else {
                    let _object = new ModelsError({
                        err: `${invoices[i].number} Отсутствует organization.pass ${invoices[i].organization.pass}`,
                        path: 'автоприем'
                    });
                    await ModelsError.create(_object)
                }
                invoices[i].editor = 'автоприем'
                let objectHistoryOrder = new HistoryOrder({
                    invoice: invoices[i]._id,
                    orders: invoices[i].orders.map(order=>{
                        return {
                            item: order.name,
                            count: order.count,
                            consignment: order.consignment,
                            returned: order.returned
                        }
                    }),
                    editor: 'автоприем',
                });
                await HistoryOrder.create(objectHistoryOrder);
                await invoices[i].save()
                invoices[i].adss = await Ads.find({_id: {$in: invoices[i].adss}})
                pubsub.publish(RELOAD_ORDER, { reloadOrder: {
                        who: null,
                        client: invoices[i].client._id,
                        agent: invoices[i].agent?invoices[i].agent._id:undefined,
                        superagent: undefined,
                        organization: invoices[i].organization._id,
                        distributer: undefined,
                        invoice: invoices[i],
                        manager: undefined,
                        type: 'SET'
                    } });
            }
            //генерация акционых заказов
            organizations = await Organization.find({
                $and: [
                    {pass: {$ne: null}},
                    {pass: {$ne: ''}},
                ]
            }).distinct('pass').lean()
            for(let i = 0; i<organizations.length;i++) {
                await reductionOutAdsXML(organizations[i])
            }
            //очистка выгрузок
            let date = new Date()
            if(date.getDay()===1) {
                date.setDate(date.getDate() - 7)
                await SingleOutXML.deleteMany({date: {$lte: date}})
                await OutXMLShoro.deleteMany({date: {$lte: date}})
                await SingleOutXMLReturned.deleteMany({date: {$lte: date}})
                await OutXMLReturnedShoro.deleteMany({date: {$lte: date}})
            }
        } catch (err) {
            let _object = new ModelsError({
                err: err.message,
                path: 'singleOutXML thread'
            });
            ModelsError.create(_object)
            console.error(err)
        }
    });
}