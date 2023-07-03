const Returned = require('../models/returned');
const SubBrand = require('../models/subBrand');

module.exports.reductionReturneds = async() => {
    /*let invoices = await Invoice.find({
        city: null
    })
    console.log('reductionInvoices:',invoices.length)*/
    let subBrands = await SubBrand.find()
        .distinct('_id')
        .lean()
    await Returned.deleteMany({organization: {$in: subBrands}});
    /*for (let i = 0; i < invoices.length; i++) {
        invoices[i].city = 'Бишкек'
        await invoices[i].save()
    }*/
}