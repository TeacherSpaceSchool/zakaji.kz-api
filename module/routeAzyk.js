const RouteAzyk = require('../models/routeAzyk');
const InvoiceAzyk = require('../models/invoiceAzyk');

module.exports.reductionToRoute = async() => {
    await RouteAzyk.deleteMany()
    await InvoiceAzyk.updateMany({}, {distributed: false})
}