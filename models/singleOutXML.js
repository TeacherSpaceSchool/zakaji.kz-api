const mongoose = require('mongoose');

const singleOutXMLSchema = mongoose.Schema({
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
        ref: 'Invoice'
    },
    status: String,
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    },
    pass: String,
}, {
    timestamps: true
});


const singleOutXML = mongoose.model('singleOutXMLZakajiKz', singleOutXMLSchema);

module.exports = singleOutXML;