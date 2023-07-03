const mongoose = require('mongoose');

const SubscriberSchema = mongoose.Schema({
    endpoint: String,
    keys: mongoose.Schema.Types.Mixed,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    number: String,
    status: String,
}, {
    timestamps: true
});

const Subscriber = mongoose.model('SubscriberZakajiKz', SubscriberSchema);

module.exports = Subscriber;