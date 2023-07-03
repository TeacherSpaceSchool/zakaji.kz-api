const mongoose = require('mongoose');

const Integrate1CSchema = mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client'
    },
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
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    },
    guid: String,
}, {
    timestamps: true
});


const Integrate1C = mongoose.model('Integrate1CZakajiKz', Integrate1CSchema);

module.exports = Integrate1C;