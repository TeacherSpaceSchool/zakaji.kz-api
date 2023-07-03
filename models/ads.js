const mongoose = require('mongoose');
const random = require('mongoose-random');

const AdsSchema = mongoose.Schema({
    image: String,
    url: String,
    xid: {
        type: String,
        default: ''
    },
    xidNumber: {
        type: Number,
        default: 0
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    },
    del: String,
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
    },
    count: {
        type: Number,
        default: 0
    },
    title: String,
    targetItems: [{
        xids: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item',
            default: []
        }],
        count: {
            type: Number,
            default: 0
        },
        sum: {
            type: Boolean,
            default: false
        },
        type: {
            type: String,
            default: 'Количество'
        },
        targetPrice: {
            type: Number,
            default: 0
        },
    }],
    targetPrice: {
        type: Number,
        default: 0
    },
    multiplier: {
        type: Boolean,
        default: false
    },
    targetType: {
        type: String,
        default: 'Цена'
    },
}, {
    timestamps: true
});

AdsSchema.plugin(random, { path: 'r' });

const Ads = mongoose.model('AdsZakajiKz', AdsSchema);

module.exports = Ads;