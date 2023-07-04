const mongoose = require('mongoose');

const Integrate1CSchema = mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ItemZakajiKz'
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClientZakajiKz'
    },
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
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationZakajiKz'
    },
    guid: String,
}, {
    timestamps: true
});


const Integrate1C = mongoose.model('Integrate1CZakajiKz', Integrate1CSchema);

module.exports = Integrate1C;