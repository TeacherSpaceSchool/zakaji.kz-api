const mongoose = require('mongoose');

const RouteSchema = mongoose.Schema({
    deliverys: [{
        legs:[[String]],
        orders: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Invoice'
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
        ref: 'Organization'
    },
    selectProdusers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    }],
    selectDistricts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'District'
    }],
    selectEcspeditor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employment'
    },
    selectAuto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auto'
    },
    selectedOrders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice'
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