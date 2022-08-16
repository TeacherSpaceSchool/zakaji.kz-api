const mongoose = require('mongoose');

const CategoryAzykSchema = mongoose.Schema({
    name: String,
    image: String,
    status: String,
}, {
    timestamps: true
});


const CategoryAzyk = mongoose.model('CategoryAzyk', CategoryAzykSchema);

module.exports = CategoryAzyk;