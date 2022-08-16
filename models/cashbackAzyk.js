const mongoose = require('mongoose');

const CashbackAzykSchema = mongoose.Schema({
    free: Number,
    spec: Number,
    normal: Number,
}, {
    timestamps: true
});


const CashbackAzyk = mongoose.model('CashbackAzyk', CashbackAzykSchema);

module.exports = CashbackAzyk;