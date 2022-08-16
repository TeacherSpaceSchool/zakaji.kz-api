const mongoose = require('mongoose');

const outXMLShoroSchema = mongoose.Schema({
    data: mongoose.Schema.Types.Mixed,
    guid: String,
    date: Date,
    number: String,
    agent: String,
    forwarder: String,
    exc: String,
    client: String,
    payment: Number,
    inv: Number,
    track: {
        type: Number,
        default: 1
    },
    promo: Number,
    invoice: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InvoiceAzyk'
    },
    status: String
}, {
    timestamps: true
});


const outXMLShoro = mongoose.model('outXMLShoro', outXMLShoroSchema);

module.exports = outXMLShoro;