const Route = require('../models/route');
const Invoice = require('../models/invoice');

module.exports.reductionToRoute = async() => {
    await Route.deleteMany()
    await Invoice.updateMany({}, {distributed: false})
}