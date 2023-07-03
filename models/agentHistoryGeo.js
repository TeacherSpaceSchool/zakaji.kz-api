const mongoose = require('mongoose');

const AgentHistoryGeoSchema = mongoose.Schema({
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employment'
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client'
    },
    geo: String
}, {
    timestamps: true
});


const AgentHistoryGeo = mongoose.model('AgentHistoryGeoZakajiKz', AgentHistoryGeoSchema);

module.exports = AgentHistoryGeo;