const mongoose = require('mongoose');

const SpecialPriceClientSchema = mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ItemZakajiKz'
    },
    price: Number,
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClientZakajiKz'
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationZakajiKz'
    },
}, {
    timestamps: true
});

SpecialPriceClientSchema.index({client: 1})
SpecialPriceClientSchema.index({organization: 1})

const SpecialPriceClient = mongoose.model('SpecialPriceClientZakajiKz', SpecialPriceClientSchema);

module.exports = SpecialPriceClient;