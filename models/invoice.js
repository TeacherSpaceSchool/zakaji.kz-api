const mongoose = require('mongoose');

const InvoiceSchema = mongoose.Schema({
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderZakajiKz'
    }],
    adss: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AdsZakajiKz'
        }],
    priority: {
        type: Number,
        default: 0
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClientZakajiKz'
    },
    allPrice: Number,
    consignmentPrice: {
        type: Number,
        default: 0
    },
    returnedPrice: {
        type: Number,
        default: 0
    },
    allTonnage: {
        type: Number,
        default: 0
    },
    allSize: {
        type: Number,
        default: 0
    },
    inv: {
        type: Number,
        default: 0
    },
    city: {
        type: String,
        default: 'Алматы'
    },
    number: String,
    guid: String,
    info: String,
    address: [String],
    paymentMethod: String,
    dateDelivery: Date,
    confirmationForwarder: Boolean,
    confirmationClient: Boolean,
    paymentConsignation: Boolean,
    cancelClient: {
        type: Date,
        default: null
    },
    cancelForwarder: {
        type: Date,
        default: null
    },
    sync: {
        type: Number,
        default: 0
    },
    track: {
        type: Number,
        default: 1
    },
    forwarder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmploymentZakajiKz'
    },
    taken: {
        type: Boolean,
        default: false
    },
    distributed: {
        type: Boolean,
        default: false
    },
    del: String,
    district: String,
    discount: Number,
    editor: String,
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmploymentZakajiKz'
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationZakajiKz'
    },
    distributer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationZakajiKz',
        default: null
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationZakajiKz',
        default: null
    },
    sale: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationZakajiKz',
        default: null
    },
    who: mongoose.Schema.Types.ObjectId
}, {
    timestamps: true
});

InvoiceSchema.index({createdAt: 1})
InvoiceSchema.index({adss: 1})
InvoiceSchema.index({client: 1})
InvoiceSchema.index({taken: 1})
InvoiceSchema.index({cancelClient: 1})
InvoiceSchema.index({cancelForwarder: 1})
InvoiceSchema.index({number: 1})
InvoiceSchema.index({info: 1})
InvoiceSchema.index({address: 1})
InvoiceSchema.index({paymentMethod: 1})
InvoiceSchema.index({dateDelivery: 1})
InvoiceSchema.index({del: 1})
InvoiceSchema.index({agent: 1})
InvoiceSchema.index({organization: 1})
InvoiceSchema.index({distributer: 1})
InvoiceSchema.index({provider: 1})
InvoiceSchema.index({sale: 1});

const Invoice = mongoose.model('InvoiceZakajiKz', InvoiceSchema);

module.exports = Invoice;