const mongoose = require('mongoose');

const OrderSchema = mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
    },
    count: Number,
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client'
    },
    consignment: {
        type: Number,
        default: 0
    },
    returned: {
        type: Number,
        default: 0
    },
    consignmentPrice: {
        type: Number,
        default: 0
    },
    costPrice: {
        type: Number,
        default: 0
    },
    allPrice: Number,
    allTonnage: {
        type: Number,
        default: 0
    },
    allSize: {
        type: Number,
        default: 0
    },
    status: String,
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employment'
    },
    setRoute: {
        type: Boolean,
        default: false
    },
    ads: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ads'
    },
}, {
    timestamps: true
});


const Order = mongoose.model('OrderZakajiKz', OrderSchema);

module.exports = Order;