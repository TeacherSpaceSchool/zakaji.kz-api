const mongoose = require('mongoose');

const SpecialPriceClientSchema = mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
    },
    price: Number,
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client'
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    },
}, {
    timestamps: true
});

SpecialPriceClientSchema.index({client: 1})
SpecialPriceClientSchema.index({organization: 1})

const SpecialPriceClient = mongoose.model('SpecialPriceClientZakajiKz', SpecialPriceClientSchema);

module.exports = SpecialPriceClient;