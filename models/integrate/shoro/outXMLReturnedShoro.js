const mongoose = require('mongoose');

const outXMLReturnedShoroSchema = mongoose.Schema({
    data: mongoose.Schema.Types.Mixed,
    guid: String,
    date: Date,
    number: String,
    client: String,
    agent: String,
    forwarder: String,
    exc: String,
    returned: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Returned'
    },
    track: {
        type: Number,
        default: 1
    },
    status: String
}, {
    timestamps: true
});


const outXMLReturnedShoro = mongoose.model('outXMLReturnedShoroZakajiKz', outXMLReturnedShoroSchema);

module.exports = outXMLReturnedShoro;