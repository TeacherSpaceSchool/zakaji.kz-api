const mongoose = require('mongoose');

const LotteryAzykSchema = mongoose.Schema({
    image: String,
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationAzyk'
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
            ref: 'ClientAzyk'
        },
        prize: String
    }]
}, {
    timestamps: true
});

const LotteryAzyk = mongoose.model('LotteryAzyk', LotteryAzykSchema);

module.exports = LotteryAzyk;