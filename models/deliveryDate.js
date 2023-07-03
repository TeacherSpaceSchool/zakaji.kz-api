const mongoose = require('mongoose');

const DeliveryDateSchema = mongoose.Schema({
    days: {
        type: [Boolean],
        default: [true, true, true, true, true, true, true]
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client'
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    },
    priority: {
        type: Number,
        default: 0
    },
}, {
    timestamps: true
});


const DeliveryDate = mongoose.model('DeliveryDateZakajiKz', DeliveryDateSchema);

module.exports = DeliveryDate;