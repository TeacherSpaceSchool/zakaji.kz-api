const mongoose = require('mongoose');

const DistributerSchema = mongoose.Schema({
    distributer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationZakajiKz'
    },
    sales: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationZakajiKz'
    }],
    provider: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationZakajiKz'
    }],
}, {
    timestamps: true
});


const Distributer = mongoose.model('DistributerZakajiKz', DistributerSchema);

module.exports = Distributer;