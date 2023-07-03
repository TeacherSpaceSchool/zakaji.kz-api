const Merchandising = require('../models/merchandising');
const {saveBase64ToFile, deleteFile, urlMain} = require('./const');

module.exports.reductionMerchandising = async() => {
    let date = new Date('2022-03-01T03:00:00.000Z')
    console.log('Merchandising delete:', await Merchandising.deleteMany({date: {$lte: date}}))

    let merchandisings = await Merchandising.find({images: {'$regex': ';base64,', '$options': 'i'}}).select('_id images').lean()
    console.log('Merchandising base64:', merchandisings.length)
    for(let i=0; i<merchandisings.length; i++) {
        for(let i1=0; i1<merchandisings[i].images.length; i1++) {
            await deleteFile(merchandisings[i].images[i1])
            merchandisings[i].images[i1] = urlMain + await saveBase64ToFile(merchandisings[i].images[i1])
        }
        merchandisings[i].images = [...merchandisings[i].images]
        await Merchandising.updateOne({_id: merchandisings[i]._id}, {images: merchandisings[i].images})
    }
}