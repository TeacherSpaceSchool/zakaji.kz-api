const mongoose = require('mongoose');

const subCategoryAzykSchema = mongoose.Schema({
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CategoryAzyk'
    },
    name: String,
    status: String,
}, {
    timestamps: true
});


const subCategoryAzyk = mongoose.model('SubCategoryAzyk', subCategoryAzykSchema);

module.exports = subCategoryAzyk;