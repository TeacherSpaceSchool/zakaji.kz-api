const { reductionCategory } = require('../module/category');
const { reductionSubCategory } = require('../module/subCategory');
const { reductionSubBrands } = require('../module/subBrand');
const { reductionToRoute } = require('../module/route');
const { reductionToAgentRoute } = require('../module/agentRoute');
const { reductionSingleOutXML } = require('../module/reductionSingleOutXML');
const { reductionReviews } = require('../module/review');
const { reductionOutAdsXML } = require('../module/singleOutXML');
const { reductionToOrganization } = require('../module/organization');
const { reductionToEmployment } = require('../module/employment');
const { reductionToClient } = require('../module/client');
const { reductionToAds } = require('../module/ads');
const { reductionToItem } = require('../module/item');
const { reductionInvoices } = require('../module/invoice');
const { reductionReturneds } = require('../module/returned');
const { reductionToDeliveryDate } = require('../module/deliveryDate');
const { reductionMerchandising } = require('../module/merchandising');
const { reductionRepairEquipment } = require('../module/repairEquipment');
const { startClientRedis } = require('../module/redis');
const { reductionToUser, createAdmin } = require('../module/user');
const { Worker, isMainThread } = require('worker_threads');
const Organization = require('../models/organization');
const Invoice = require('../models/invoice');
const Order = require('../models/order');
const { setSingleOutXML } = require('../module/singleOutXML');
const { checkAdss } = require('../graphql/ads');
const { pubsub } = require('../graphql/index');
const Merchandising = require('../models/merchandising');

let startDeleteBD = async () => {
    if(isMainThread) {
        let w = new Worker('./thread/deleteBD.js', {workerData: 0});
        w.on('message', (msg) => {
            console.log('DeleteBD: '+msg);
        })
        w.on('error', console.error);
        w.on('exit', (code) => {
            if(code !== 0)
                console.error(new Error(`DeleteBD stopped with exit code ${code}`))
        });
        console.log('DeleteBD '+w.threadId+ ' run')
    }
}

let startResetUnloading = async () => {
    if(isMainThread) {
        let w = new Worker('./thread/resetUnloading.js', {workerData: 0});
        w.on('message', (msg) => {
            console.log('ResetUnloading: '+msg);
        })
        w.on('error', console.error);
        w.on('exit', (code) => {
            if(code !== 0)
                console.error(new Error(`ResetUnloading stopped with exit code ${code}`))
        });
        console.log('ResetUnloading '+w.threadId+ ' run')
    }
}

let startOutXMLShoro = async () => {
    if(isMainThread) {
        let w = new Worker('./thread/singleOutXML.js', {workerData: 0});
        w.on('message', (msg) => {
            console.log('SingleOutXML: '+msg);
        })
        w.on('error', console.error);
        w.on('exit', (code) => {
            if(code !== 0)
                console.error(new Error(`SingleOutXML stopped with exit code ${code}`))
        });
        console.log('SingleOutXML '+w.threadId+ ' run')
    }
}

let startReminderClient = async () => {
    if(isMainThread) {
        let w = new Worker('./thread/reminderClient.js', {workerData: 0});
        w.on('message', (msg) => {
            console.log('ReminderClient: '+msg);
        })
        w.on('error', console.error);
        w.on('exit', (code) => {
            if(code !== 0)
                console.error(new Error(`ReminderClient stopped with exit code ${code}`))
        });
        console.log('ReminderClient '+w.threadId+ ' run')
    }
}

let start = async () => {
    await createAdmin();
    //await startClientRedis()
    //await reductionMerchandising()
    //await reductionRepairEquipment()
    await startResetUnloading()
    await startReminderClient();
    await startOutXMLShoro();
    await startDeleteBD();
    //await reductionReviews();
    //await reductionToEmployment()
    //await reductionSubBrands();
    //await reductionToDeliveryDate();
    //await reductionSingleOutXML()
    //await reductionInvoices()
    //await reductionReturneds()
    await reductionCategory()
    await reductionSubCategory()
    //await reductionToRoute()
    //await reductionToClient()
    //await reductionToOrganization()
    //await reductionToItem()
    //await reductionToUser()
    //await reductionToAgentRoute();
    //await reductionOutAdsXMLShoro()
    //await reductionToAds()
}

module.exports.start = start;
