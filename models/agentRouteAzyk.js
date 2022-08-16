const mongoose = require('mongoose');

const AgentRouteAzykSchema = mongoose.Schema({
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationAzyk'
    },
    clients: [[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClientAzyk'
    }]],
    name: String,
    district: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DistrictAzyk'
    }
}, {
    timestamps: true
});


const AgentRouteAzyk = mongoose.model('AgentRouteAzyk', AgentRouteAzykSchema);

module.exports = AgentRouteAzyk;