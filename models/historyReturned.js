const mongoose = require('mongoose');

const HistoryReturnedSchema = mongoose.Schema({
    returned: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ReturnedZakajiKz'
    },
    editor: String,
}, {
    timestamps: true
});


const HistoryReturned = mongoose.model('HistoryReturnedZakajiKz', HistoryReturnedSchema);

module.exports = HistoryReturned;