const mongoose = require('mongoose');

const DiscountClientSchema = mongoose.Schema({
    discount: Number,
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

DiscountClientSchema.index({client: 1})
DiscountClientSchema.index({organization: 1})

const DiscountClient = mongoose.model('DiscountClientZakajiKz', DiscountClientSchema);

module.exports = DiscountClient;