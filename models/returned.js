const mongoose = require('mongoose');

const ReturnedSchema = mongoose.Schema({
    items: mongoose.Schema.Types.Mixed,
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client'
    },
    dateDelivery: Date,
    allPrice: Number,
    allTonnage: {
        type: Number,
        default: 0
    },
    inv: {
        type: Number,
        default: 0
    },
    allSize: {
        type: Number,
        default: 0
    },
    number: String,
    info: String,
    address: [String],
    confirmationForwarder: {
        type: Boolean,
        default: null
    },
    cancelForwarder: {
        type: Boolean,
        default: null
    },
    sync: {
        type: Number,
        default: 0
    },
    del: String,
    editor: String,
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    },
    sale: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        default: null
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        default: null
    },
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employment'
    },
    district: String,
    guid: String,
    city: String,
    track: {
        type: Number,
        default: 1
    },
    forwarder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employment'
    },
}, {
    timestamps: true
});


const Returned = mongoose.model('ReturnedZakajiKz', ReturnedSchema);

module.exports = Returned;