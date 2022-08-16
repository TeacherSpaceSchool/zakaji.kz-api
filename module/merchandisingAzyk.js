const MerchandisingAzyk = require('../models/merchandisingAzyk');
const {saveBase64ToFile, deleteFile, urlMain} = require('./const');

module.exports.reductionMerchandising = async() => {
    let date = new Date('2022-03-01T03:00:00.000Z')
    console.log('MerchandisingAzyk delete:', await MerchandisingAzyk.deleteMany({date: {$lte: date}}))

    console.log('MerchandisingAzyk base64:', await MerchandisingAzyk.countDocuments({images: {'$regex': ';base64,', '$options': 'i'}}).lean())
    let merchandisings = await MerchandisingAzyk.find({images: {'$regex': ';base64,', '$options': 'i'}}).select('_id images').lean()
    for(let i=0; i<merchandisings.length; i++) {
        for(let i1=0; i1<merchandisings[i].images.length; i1++) {
            await deleteFile(merchandisings[i].images[i1])
            merchandisings[i].images[i1] = urlMain + await saveBase64ToFile(merchandisings[i].images[i1])
        }
        merchandisings[i].images = [...merchandisings[i].images]
        await MerchandisingAzyk.updateOne({_id: merchandisings[i]._id}, {images: merchandisings[i].images})
    }
}