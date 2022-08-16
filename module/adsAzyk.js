const AdsAzyk = require('../models/adsAzyk');
const mongoose = require('mongoose');

module.exports.reductionToAds = async() => {
    let ads = await AdsAzyk.find({$and: [{targetItems: {$ne: null}}, {targetItems: {$ne: []}}]})
    console.log(`reductionToAds: ${ads.length}`)
    for(let i = 0; i<ads.length;i++){
        for(let i1 = 0; i1<ads[i].targetItems.length;i1++) {
            if(!ads[i].targetItems[i1].xids||!mongoose.Types.ObjectId.isValid(ads[i].targetItems[i1]._id)) {
                ads[i].targetItems[i1]._id = mongoose.Types.ObjectId();
                ads[i].targetItems[i1].xids = [];
            }
        }
        await ads[i].save()
    }
}