const SubBrand = require('../models/subBrand');

module.exports.reductionSubBrands = async() => {
    let subBrands = await SubBrand.find({
        cities: null
    })
    console.log('reductionSubBrands:',subBrands.length)
    for (let i = 0; i < subBrands.length; i++) {
        subBrands[i].cities = ['Бишкек']
        await subBrands[i].save()
    }
}