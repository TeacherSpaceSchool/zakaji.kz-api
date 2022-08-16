const SubCategoryAzyk = require('../models/subCategoryAzyk');
const CategoryAzyk = require('../models/categoryAzyk');
let subCategoryUndefinedId = '';
module.exports.reductionSubCategoryAzyk = async()=>{
    let subCategoryyUndefined = await SubCategoryAzyk.findOne({name: 'Не задано'});
    if(!subCategoryyUndefined) {
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


module.exports.getSubCategoryUndefinedId = () => {
    return subCategoryUndefinedId
}