const DistributerAzyk = require('../models/distributerAzyk');
module.exports.startDistributerAzyk = async()=>{
    let distributerAzyk = await DistributerAzyk.findOne({distributer: null});
    if(!distributerAzyk) {
        let categoryUndefined = await CategoryAzyk.findOne({name: 'Не задано'});
        let _object = new SubCategoryAzyk({
            category: categoryUndefined._id,
            name: 'Не задано',
            status: 'active'
        });
        subCategoryyUndefined = await SubCategoryAzyk.create(_object)
    }
    subCategoryUndefinedId = subCategoryyUndefined._id
}