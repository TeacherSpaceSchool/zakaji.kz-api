const Invoice = require('../models/invoice');

module.exports.reductionInvoices = async() => {
    /*let invoices = await Invoice.find({
        city: null
    })*/
    console.log('reductionInvoices:', await Invoice.updateMany({city: null}, {city: 'Бишкек'}));
    /*for (let i = 0; i < invoices.length; i++) {
        invoices[i].city = 'Бишкек'
        await invoices[i].save()
    }*/
}