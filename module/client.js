const Client = require('../models/client');
const User = require('../models/user');

module.exports.reductionToClient = async() => {
    let date = new Date('2023-10-27T03:00:00.000Z')
    const users = await User.find({createdAt: {$lte: date}, role: 'client'}).distinct('_id').lean()
    console.log(`reductionToClient: ${(await User.deleteMany({_id: {$in: users}})).n} ${(await Client.deleteMany({user: {$in: users}})).n}`)
}