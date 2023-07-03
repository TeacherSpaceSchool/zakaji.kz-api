const mongoose = require('mongoose');

const AgentRouteSchema = mongoose.Schema({
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    },
    clients: [[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client'
    }]],
    name: String,
    district: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'District'
    }
}, {
    timestamps: true
});


const AgentRoute = mongoose.model('AgentRouteZakajiKz', AgentRouteSchema);

module.exports = AgentRoute;