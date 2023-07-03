const mongoose = require('mongoose');

const CashbackSchema = mongoose.Schema({
    free: Number,
    spec: Number,
    normal: Number,
}, {
    timestamps: true
});


const Cashback = mongoose.model('CashbackZakajiKz', CashbackSchema);

module.exports = Cashback;