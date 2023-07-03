const mongoose = require('mongoose');

const singleOutXMLAdsSchema = mongoose.Schema({
    guid: String,
    district: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'District'
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    },
    pass: String,

}, {
    timestamps: true
});


const singleOutXMLAds = mongoose.model('singleOutXMLAdsZakajiKz', singleOutXMLAdsSchema);

module.exports = singleOutXMLAds;