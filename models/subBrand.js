const mongoose = require('mongoose');
const SubBrandSchema = mongoose.Schema({
    image: String,
    miniInfo: String,
    status: String,
    name: String,
    priotiry: {
        type: Number,
        default: 0
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    },
    del: String,
    cities: [String]
}, {
    timestamps: true
});

const SubBrand = mongoose.model('SubBrandZakajiKz', SubBrandSchema);


module.exports = SubBrand;