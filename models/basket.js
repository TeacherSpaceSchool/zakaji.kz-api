const mongoose = require('mongoose');

const BasketSchema = mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ItemZakajiKz'
    },
    count: Number,
    specialPrice: Number,
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClientZakajiKz'
    },
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmploymentZakajiKz'
    },
    consignment: {
        type: Number,
        default: 0
    },
}, {
    timestamps: true
});


const Basket = mongoose.model('BasketZakajiKz', BasketSchema);

module.exports = Basket;