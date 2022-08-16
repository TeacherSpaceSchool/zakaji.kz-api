const mongoose = require('mongoose');

const DistributerAzykSchema = mongoose.Schema({
    distributer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationAzyk'
    },
    sales: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationAzyk'
    }],
    provider: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationAzyk'
    }],
}, {
    timestamps: true
});


const DistributerAzyk = mongoose.model('DistributerAzyk', DistributerAzykSchema);

module.exports = DistributerAzyk;