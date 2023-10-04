const Client = require('../models/client');

module.exports.reductionToClient = async() => {
    console.log(`reductionToClient: ${(await Client.count({
        address: {$elemMatch: {$elemMatch: {'$regex': 'search', '$options': 'i'}}}
    }))}`)
}