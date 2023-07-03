const mongoose = require('mongoose');

const HistoryOrderSchema = mongoose.Schema({
    invoice: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice'
    },
    orders: mongoose.Schema.Types.Mixed,
    editor: String,
}, {
    timestamps: true
});


const HistoryOrder = mongoose.model('HistoryOrderZakajiKz', HistoryOrderSchema);

module.exports = HistoryOrder;