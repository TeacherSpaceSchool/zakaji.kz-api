const mongoose = require('mongoose');

const CategorySchema = mongoose.Schema({
    name: String,
    image: String,
    status: String,
}, {
    timestamps: true
});


const Category = mongoose.model('CategoryZakajiKz', CategorySchema);

module.exports = Category;