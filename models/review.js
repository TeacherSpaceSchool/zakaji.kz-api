const mongoose = require('mongoose');

const ReviewSchema = mongoose.Schema({
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationZakajiKz'
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClientZakajiKz'
    },
    taken: Boolean,
    type: String,
    text: String
}, {
    timestamps: true
});


const Review = mongoose.model('ReviewZakajiKz', ReviewSchema);

module.exports = Review;