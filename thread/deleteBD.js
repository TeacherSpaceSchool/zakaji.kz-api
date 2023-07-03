const { isMainThread } = require('worker_threads');
const connectDB = require('../models/index');
const cron = require('node-cron');
const Merchandising = require('../models/merchandising');
const { deleteFile } = require('../module/const');
connectDB.connect();

if(!isMainThread) {
    cron.schedule('1 4 * * *', async() => {
        let date = new Date()
        date.setDate(date.getDate() - 60)

        let merchandisings = await Merchandising.find({date: {$lte: date}}).select('images').lean()
        for(let i=0; i<merchandisings.length; i++) {
            for(let i1=0; i1<merchandisings[i].images.length; i1++) {
                await deleteFile(merchandisings[i].images[i1])
            }
        }
        console.log(await Merchandising.deleteMany({date: {$lte: date}}))

    });
}