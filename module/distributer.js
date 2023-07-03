const Distributer = require('../models/distributer');
module.exports.startDistributer = async()=>{
    let distributer = await Distributer.findOne({distributer: null});
    if(!distributer) {
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