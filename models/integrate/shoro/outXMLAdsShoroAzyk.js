const mongoose = require('mongoose');

const OutXMLAdsShoroSchema = mongoose.Schema({
    guid: String,
    district: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DistrictAzyk'
    },

}, {
    timestamps: true
});


const OutXMLAdsShoro = mongoose.model('OutXMLAdsShoro', OutXMLAdsShoroSchema);

module.exports = OutXMLAdsShoro;