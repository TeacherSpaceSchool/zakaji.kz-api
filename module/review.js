const Review = require('../models/review');
const Organization = require('../models/organization');

module.exports.reductionReviews = async() => {
    let organizations = await Organization.find().distinct('_id').lean()
    console.log('reductionReviews:', await Review.deleteMany({organization: {$nin: organizations}}))
}