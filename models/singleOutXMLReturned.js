const mongoose = require('mongoose');

const singleOutXMLReturnedSchema = mongoose.Schema({
    data: mongoose.Schema.Types.Mixed,
    guid: String,
    date: Date,
    number: String,
    client: String,
    agent: String,
    inv: Number,
    forwarder: String,
    exc: String,
    returned: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ReturnedZakajiKz'
    },
    track: {
        type: Number,
        default: 1
    },
    status: String,
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationZakajiKz'
    },
    pass: String,
}, {
    timestamps: true
});


const singleOutXMLReturned = mongoose.model('singleOutXMLReturnedZakajiKz', singleOutXMLReturnedSchema);

module.exports = singleOutXMLReturned;