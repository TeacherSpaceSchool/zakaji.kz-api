const { isMainThread } = require('worker_threads');
const connectDB = require('../models/index');
const {sendWebPush} = require('../module/webPush');
const cron = require('node-cron');
const ModelsError = require('../models/error');
connectDB.connect()
if(!isMainThread) {
    cron.schedule('1 20 * * 1,3,5', async() => {
        try{
            sendWebPush({title: 'ZAKAJI.KZ', message: 'Не забудьте сделать свой заказ', user: 'all'})
        } catch (err) {
            let _object = new ModelsError({
                err: err.message,
                path: 'reminderClient thread'
            });
            ModelsError.create(_object)
            console.error(err)
        }
    });
}