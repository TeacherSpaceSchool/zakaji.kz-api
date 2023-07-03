const Item = require('../models/item');

module.exports.reductionToItem = async() => {
    let items = await Item.find({city: {$ne: 'Бишкек'}})
    console.log(`reductionToItem: ${items.length}`)
    for(let i = 0; i<items.length;i++){
        items[i].city = 'Бишкек'
        await items[i].save();
    }
}