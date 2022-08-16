const ReturnedAzyk = require('../models/returnedAzyk');
const SubBrandAzyk = require('../models/subBrandAzyk');

module.exports.reductionReturneds = async() => {
    /*let invoices = await InvoiceAzyk.find({
        city: null
    })
    console.log('reductionInvoices:',invoices.length)*/
    let subBrands = await SubBrandAzyk.find()
        .distinct('_id')
        .lean()
    await ReturnedAzyk.deleteMany({organization: {$in: subBrands}});
    /*for (let i = 0; i < invoices.length; i++) {
        invoices[i].city = 'Бишкек'
        await invoices[i].save()
    }*/
}