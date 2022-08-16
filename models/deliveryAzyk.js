const mongoose = require('mongoose');

const DeliveryAzykSchema = mongoose.Schema({
    free: Number,
    spec: Number,
    normal: Number,
}, {
    timestamps: true
});


const DeliveryAzyk = mongoose.model('DeliveryAzyk', DeliveryAzykSchema);

module.exports = DeliveryAzyk;