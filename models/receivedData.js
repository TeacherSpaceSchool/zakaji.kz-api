const mongoose = require('mongoose');

const ReceivedDataSchema = mongoose.Schema({
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    },
    guid: String,
    name: String,
    addres: String,
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employment'
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