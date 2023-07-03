const mongoose = require('mongoose');

const AutoSchema = mongoose.Schema({
    number: String,
    tonnage: {
        type: Number,
        default: 0
    },
    size: {
        type: Number,
        default: 0
    },
    employment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employment'
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    },
}, {
    timestamps: true
});


const Auto = mongoose.model('AutoZakajiKz', AutoSchema);

module.exports = Auto;