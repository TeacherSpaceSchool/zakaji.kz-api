const mongoose = require('mongoose');

const ItemSchema = mongoose.Schema({
    unit: {
        type: String,
        default: ''
    },
    name: String,
    image: String,
    price: Number,
    costPrice: {
        type: Number,
        default: 0
    },
    packaging:  {
        type: Number,
        default: 1
    },
    reiting: Number,
    apiece: {
        type: Boolean,
        default: false
    },
    subCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategory'
    },
    subBrand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubBrand'
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    },
    hit: Boolean,
    latest: Boolean,
    del: String,
    status: String,
    info: String,
    categorys: [String],
    city: String,
    weight: {
        type: Number,
        default: 0
    },
    priotiry: {
        type: Number,
        default: 0
    },
    size: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});


const Item = mongoose.model('ItemZakajiKz', ItemSchema);

module.exports = Item;