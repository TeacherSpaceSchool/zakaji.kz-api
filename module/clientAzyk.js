const ClientAzyk = require('../models/clientAzyk');

module.exports.reductionToClient = async() => {
    let clients = await ClientAzyk.find({city: {$ne: 'Бишкек'}})
    console.log(`reductionToClient: ${clients.length}`)
    for(let i = 0; i<clients.length;i++){
        clients[i].city = 'Бишкек'
        await clients[i].save();
    }
}