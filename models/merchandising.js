const mongoose = require('mongoose');

const MerchandisingSchema = mongoose.Schema({
    employment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employment'
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client'
    },
    date: Date,
    productAvailability: [String],
    productInventory: Boolean,
    productConditions: Number,
    productLocation: Number,
    images: [String],
    fhos: mongoose.Schema.Types.Mixed,
    needFho: Boolean,
    check: Boolean,
    stateProduct: Number,
    comment: String,
    geo: String,
    reviewerScore: {
        type: Number,
        default: 0
    },
    reviewerComment: {
        type: String,
        default: ''
    },
}, {
    timestamps: true
});

MerchandisingSchema.index({date: 1})
MerchandisingSchema.index({stateProduct: 1})
MerchandisingSchema.index({check: 1})
MerchandisingSchema.index({organization: 1});
MerchandisingSchema.index({client: 1});
MerchandisingSchema.index({employment: 1});

const Merchandising = mongoose.model('MerchandisingZakajiKz', MerchandisingSchema);

module.exports = Merchandising;