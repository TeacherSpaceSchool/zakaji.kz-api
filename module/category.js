const Category = require('../models/category');
let categoryUndefinedId = '';
module.exports.reductionCategory = async()=>{
    let categoryUndefined = await Category.findOne({name: 'Не задано'});
    if(!categoryUndefined) {
        let _object = new Category({
            image: '/static/add.png',
            name: 'Не задано',
            status: 'active'
        });
        categoryUndefined = await Category.create(_object)
    }
    categoryUndefinedId = categoryUndefined._id
}


module.exports.getCategoryUndefinedId = () => {
    return categoryUndefinedId
}