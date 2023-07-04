const mongoose = require('mongoose');

const AgentRouteSchema = mongoose.Schema({
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationZakajiKz'
    },
    clients: [[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClientZakajiKz'
    }]],
    name: String,
    district: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DistrictZakajiKz'
    }
}, {
    timestamps: true
});


const AgentRoute = mongoose.model('AgentRouteZakajiKz', AgentRouteSchema);

module.exports = AgentRoute;