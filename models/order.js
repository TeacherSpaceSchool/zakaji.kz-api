const mongoose = require('mongoose');

const OrderSchema = mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ItemZakajiKz'
    },
    count: Number,
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClientZakajiKz'
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
        ref: 'EmploymentZakajiKz'
    },
    setRoute: {
        type: Boolean,
        default: false
    },
    ads: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdsZakajiKz'
    },
}, {
    timestamps: true
});


const Order = mongoose.model('OrderZakajiKz', OrderSchema);

module.exports = Order;