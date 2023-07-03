const mongoose = require('mongoose');

const BasketSchema = mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
    },
    count: Number,
    specialPrice: Number,
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client'
    },
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employment'
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