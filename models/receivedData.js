const mongoose = require('mongoose');

const ReceivedDataSchema = mongoose.Schema({
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationZakajiKz'
    },
    guid: String,
    name: String,
    addres: String,
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmploymentZakajiKz'
    },
    phone: String,
    type: String,
    status: String,
    position: String,
}, {
    timestamps: true
});

const ReceivedData = mongoose.model('ReceivedDataZakajiKz', ReceivedDataSchema);

module.exports = ReceivedData;