const mongoose = require('mongoose');

const NotificationStatisticSchema = mongoose.Schema({
    tag: String,
    url: String,
    icon: String,
    title: String,
    text: String,
    delivered: Number,
    failed: Number,
    click: {
        type: Number,
        default: 0
    },
    ips: {
        type: [String],
        default: []
    },
    who: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
}, {
    timestamps: true
});


const NotificationStatistic = mongoose.model('NotificationStatisticZakajiKz', NotificationStatisticSchema);

module.exports = NotificationStatistic;