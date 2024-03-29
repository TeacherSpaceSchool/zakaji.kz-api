const mongoose = require('mongoose');

const outXMLClientShoroSchema = mongoose.Schema({
    guid: String,
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClientZakajiKz'
    },
    exc: String
}, {
    timestamps: true
});


const outXMLClientShoro = mongoose.model('outXMLClientShoroZakajiKz', outXMLClientShoroSchema);

module.exports = outXMLClientShoro;