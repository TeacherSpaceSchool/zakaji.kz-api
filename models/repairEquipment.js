const mongoose = require('mongoose');

const RepairEquipmentSchema = mongoose.Schema({
    number: String,
    status: String,
    equipment: String,
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClientZakajiKz'
    },
    repairMan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmploymentZakajiKz'
    },
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmploymentZakajiKz'
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationZakajiKz'
    },
    accept: {
        type: Boolean,
        default: false
    },
    done: {
        type: Boolean,
        default: false
    },
    cancel: {
        type: Boolean,
        default: false
    },
    defect: [String],
    repair: [String],
    dateRepair: Date,
}, {
    timestamps: true
});


const RepairEquipment = mongoose.model('RepairEquipmentZakajiKz', RepairEquipmentSchema);

module.exports = RepairEquipment;