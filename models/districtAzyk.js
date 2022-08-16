const mongoose = require('mongoose');

const DistrictAzykSchema = mongoose.Schema({
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationAzyk'
    },
    client: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClientAzyk'
    }],
    name: String,
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmploymentAzyk'
    },
    ecspeditor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmploymentAzyk'
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmploymentAzyk'
    },
}, {
    timestamps: true
});


const DistrictAzyk = mongoose.model('DistrictAzyk', DistrictAzykSchema);

module.exports = DistrictAzyk;