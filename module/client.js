const Client = require('../models/client');

module.exports.reductionToClient = async() => {
    let clients = await Client.find({city: {$ne: 'Алматы'}})
    console.log(`reductionToClient: ${clients.length}`)
    for(let i = 0; i<clients.length;i++){
        clients[i].city = 'Алматы'
        await clients[i].save();
    }
}