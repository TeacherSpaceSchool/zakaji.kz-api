const mongoose = require('mongoose');

const DistrictSchema = mongoose.Schema({
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationZakajiKz'
    },
    client: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClientZakajiKz'
    }],
    name: String,
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmploymentZakajiKz'
    },
    ecspeditor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmploymentZakajiKz'
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmploymentZakajiKz'
    },
}, {
    timestamps: true
});


const District = mongoose.model('DistrictZakajiKz', DistrictSchema);

module.exports = District;