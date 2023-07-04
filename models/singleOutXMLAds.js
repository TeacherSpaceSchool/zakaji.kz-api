const mongoose = require('mongoose');

const singleOutXMLAdsSchema = mongoose.Schema({
    guid: String,
    district: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DistrictZakajiKz'
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationZakajiKz'
    },
    pass: String,

}, {
    timestamps: true
});


const singleOutXMLAds = mongoose.model('singleOutXMLAdsZakajiKz', singleOutXMLAdsSchema);

module.exports = singleOutXMLAds;