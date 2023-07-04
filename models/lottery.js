const mongoose = require('mongoose');

const LotterySchema = mongoose.Schema({
    image: String,
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationZakajiKz'
    },
    status: String,
    text: String,
    date: Date,
    prizes: [{
        image: String,
        name: String,
        count:  Number
    }],
    photoReports: [{
        image: String,
        text: String,
    }],
    tickets: [{
        status: String,
        number: String,
        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ClientZakajiKz'
        },
        prize: String
    }]
}, {
    timestamps: true
});

const Lottery = mongoose.model('LotteryZakajiKz', LotterySchema);

module.exports = Lottery;