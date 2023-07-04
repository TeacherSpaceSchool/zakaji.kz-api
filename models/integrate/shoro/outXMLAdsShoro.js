const mongoose = require('mongoose');

const OutXMLAdsShoroSchema = mongoose.Schema({
    guid: String,
    district: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DistrictZakajiKz'
    },

}, {
    timestamps: true
});


const OutXMLAdsShoro = mongoose.model('OutXMLAdsShoroZakajiKz', OutXMLAdsShoroSchema);

module.exports = OutXMLAdsShoro;