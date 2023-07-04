const mongoose = require('mongoose');

const RouteSchema = mongoose.Schema({
    deliverys: [{
        legs:[[String]],
        orders: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'InvoiceZakajiKz'
        }],
        tonnage: {
            type: Number,
            default: 0
        },
        lengthInMeters: {
            type: Number,
            default: 0
        }
    }],
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationZakajiKz'
    },
    selectProdusers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationZakajiKz'
    }],
    selectDistricts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DistrictZakajiKz'
    }],
    selectEcspeditor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmploymentZakajiKz'
    },
    selectAuto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AutoZakajiKz'
    },
    selectedOrders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InvoiceZakajiKz'
    }],
    dateDelivery: Date,
    status: String,
    number: String,
    allTonnage: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});


const Route = mongoose.model('RouteZakajiKz', RouteSchema);

module.exports = Route;