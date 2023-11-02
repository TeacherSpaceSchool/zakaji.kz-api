const Item = require('../models/item');
const Integrate1C = require('../models/integrate1C');
const Order = require('../models/order');
const Invoice = require('../models/invoice');
const SingleOutXML = require('../models/singleOutXML');

module.exports.reductionToItem = async() => {
    const date = new Date('2023-11-01T00:00:00.000Z')
    const items = await Item.find({createdAt: {$lte: date}})
        .distinct('_id')
        .lean()
    const deletedItems = await Item.deleteMany({_id: {$in: items}})
    const deletedIntegrates = await Integrate1C.deleteMany({item: {$in: items}})
    const orders = await Order.find({item: {$in: items}})
        .distinct('_id')
        .lean()
    const deletedOrders = await Order.deleteMany({_id: {$in: orders}})
    const invoices = await Invoice.find({orders: {$in: orders}})
        .distinct('_id')
        .lean()
    const deletedInvoices = await Invoice.deleteMany({_id: {$in: invoices}})
    const deletedSingleOutXML = await SingleOutXML.deleteMany({invoice: {$in: invoices}})
    console.log({
        deletedIntegrates: deletedIntegrates.n,
        deletedOrders: deletedOrders.n,
        deletedInvoices: deletedInvoices.n,
        deletedSingleOutXML: deletedSingleOutXML.n,
        deletedItems: deletedItems.n
    })
}