const mongoose = require('mongoose');

const ClientSchema = mongoose.Schema({
    name: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    phone: [String],
    address: [[String]],
    sync:  {
        type: [String],
        default: []
    },
    info: {
        type: String,
        default: ''
    },
    lastActive: {
        type: Date,
        default: null
    },
    reiting: Number,
    image: String,
    category: {
        type: String,
        default: 'B'
    },
    city: String,
    device: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    notification: {
        type: Boolean,
        default: null
    },
    del: String,
}, {
    timestamps: true
});


const Client = mongoose.model('ClientZakajiKz', ClientSchema);

module.exports = Client;