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
const { pubsub } = require('../graphql/index');
const RELOAD_ORDER = 'RELOAD_ORDER';

connectDB.connect()
if(!isMainThread) {
    cron.schedule('1 3 * * *', async() => {
        try {
            //автоприем заказов
            let dateStart = new Date()
            dateStart.setHours(3, 0, 0, 0)
            dateStart.setDate(dateStart.getDate() - 1)
            let dateEnd = new Date(dateStart)
            dateEnd.setDate(dateEnd.getDate() + 1)
            let organizations = await Organization.find({autoAcceptNight: true}).distinct('_id').lean()
            let orders = await Invoice.find({
                del: {$ne: 'deleted'},
                taken: {$ne: true},
                cancelClient: null,
                cancelForwarder: null,
                $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}],
                organization: {$in: organizations}
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
            for(let i = 0; i<orders.length;i++) {
                orders[i].taken = true
                await Order.updateMany({_id: {$in: orders[i].orders.map(element=>element._id)}}, {status: 'принят'})
                orders[i].adss = await checkAdss(orders[i])
                if(orders[i].organization.pass&&orders[i].organization.pass.length){
                    orders[i].sync = await setSingleOutXML(orders[i])
                }
                await orders[i].save()
                orders[i].adss = await Ads.find({_id: {$in: orders[i].adss}})
                pubsub.publish(RELOAD_ORDER, { reloadOrder: {
                    who: null,
                    client: orders[i].client._id,
                    agent: orders[i].agent?orders[i].agent._id:undefined,
                    superagent: undefined,
                    organization: orders[i].organization._id,
                    distributer: undefined,
                    invoice: orders[i],
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