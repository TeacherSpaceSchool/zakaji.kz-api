const SubBrandAzyk = require('../models/subBrandAzyk');

module.exports.reductionSubBrands = async() => {
    let subBrands = await SubBrandAzyk.find({
        cities: null
    })
    console.log('reductionSubBrands:',subBrands.length)
    for (let i = 0; i < subBrands.length; i++) {
        subBrands[i].cities = ['Бишкек']
        await subBrands[i].save()
    }
}