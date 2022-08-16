const ReviewAzyk = require('../models/reviewAzyk');
const OrganizationAzyk = require('../models/organizationAzyk');

module.exports.reductionReviews = async() => {
    let organizations = await OrganizationAzyk.find().distinct('_id').lean()
    console.log('reductionReviews:', await ReviewAzyk.deleteMany({organization: {$nin: organizations}}))
}