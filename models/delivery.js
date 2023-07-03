const mongoose = require('mongoose');

const DeliverySchema = mongoose.Schema({
    free: Number,
    spec: Number,
    normal: Number,
}, {
    timestamps: true
});


const Delivery = mongoose.model('DeliveryZakajiKz', DeliverySchema);

module.exports = Delivery;