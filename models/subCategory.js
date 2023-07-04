const mongoose = require('mongoose');

const subCategorySchema = mongoose.Schema({
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CategoryZakajiKz'
    },
    name: String,
    status: String,
}, {
    timestamps: true
});


const subCategory = mongoose.model('SubCategoryZakajiKz', subCategorySchema);

module.exports = subCategory;