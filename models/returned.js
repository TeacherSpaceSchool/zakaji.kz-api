const mongoose = require('mongoose');

const ReturnedSchema = mongoose.Schema({
    items: mongoose.Schema.Types.Mixed,
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClientZakajiKz'
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
        ref: 'OrganizationZakajiKz'
    },
    sale: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationZakajiKz',
        default: null
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationZakajiKz',
        default: null
    },
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmploymentZakajiKz'
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
        ref: 'EmploymentZakajiKz'
    },
}, {
    timestamps: true
});


const Returned = mongoose.model('ReturnedZakajiKz', ReturnedSchema);

module.exports = Returned;