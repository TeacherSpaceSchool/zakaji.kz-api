const RepairEquipmentAzyk = require('../models/repairEquipmentAzyk');

module.exports.reductionRepairEquipment = async() => {
    let date = new Date('2022-03-01T03:00:00.000Z')
    console.log('RepairEquipmentAzyk delete:', await RepairEquipmentAzyk.deleteMany({createdAt: {$lte: date}}))
}