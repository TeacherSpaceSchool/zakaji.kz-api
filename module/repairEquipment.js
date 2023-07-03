const RepairEquipment = require('../models/repairEquipment');

module.exports.reductionRepairEquipment = async() => {
    let date = new Date('2022-03-01T03:00:00.000Z')
    console.log('RepairEquipment delete:', await RepairEquipment.deleteMany({createdAt: {$lte: date}}))
}