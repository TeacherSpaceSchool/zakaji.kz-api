const SubCategory = require('../models/subCategory');
const Category = require('../models/category');
let subCategoryUndefinedId = '';
module.exports.reductionSubCategory = async()=>{
    let subCategoryyUndefined = await SubCategory.findOne({name: 'Не задано'});
    if(!subCategoryyUndefined) {
        let categoryUndefined = await Category.findOne({name: 'Не задано'});
        let _object = new SubCategory({
            category: categoryUndefined._id,
            name: 'Не задано',
            status: 'active'
        });
        subCategoryyUndefined = await SubCategory.create(_object)
    }
    subCategoryUndefinedId = subCategoryyUndefined._id
}


module.exports.getSubCategoryUndefinedId = () => {
    return subCategoryUndefinedId
}