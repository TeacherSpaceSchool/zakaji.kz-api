const User = require('../models/user');

module.exports.reductionToClient = async() => {
    let date = new Date('2023-08-01T03:00:00.000Z')
    console.log(`reductionToClient: ${(await User.updateMany({status: 'deactive', createdAt: {$lte: date}}, {status: 'active'})).n}`)
}