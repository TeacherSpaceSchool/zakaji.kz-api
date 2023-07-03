const mongoose = require('mongoose');

const DistributerSchema = mongoose.Schema({
    distributer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    },
    sales: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    }],
    provider: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    }],
}, {
    timestamps: true
});


const Distributer = mongoose.model('DistributerZakajiKz', DistributerSchema);

module.exports = Distributer;