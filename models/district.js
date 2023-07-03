const mongoose = require('mongoose');

const DistrictSchema = mongoose.Schema({
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    },
    client: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client'
    }],
    name: String,
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employment'
    },
    ecspeditor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employment'
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employment'
    },
}, {
    timestamps: true
});


const District = mongoose.model('DistrictZakajiKz', DistrictSchema);

module.exports = District;