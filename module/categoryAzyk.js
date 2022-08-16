const CategoryAzyk = require('../models/categoryAzyk');
let categoryUndefinedId = '';
module.exports.reductionCategoryAzyk = async()=>{
    let categoryUndefined = await CategoryAzyk.findOne({name: 'Не задано'});
    if(!categoryUndefined) {
        let _object = new CategoryAzyk({
            image: '/static/add.png',
            name: 'Не задано',
            status: 'active'
        });
        categoryUndefined = await CategoryAzyk.create(_object)
    }
    categoryUndefinedId = categoryUndefined._id
}


module.exports.getCategoryUndefinedId = () => {
    return categoryUndefinedId
}