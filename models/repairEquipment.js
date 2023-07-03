const mongoose = require('mongoose');

const RepairEquipmentSchema = mongoose.Schema({
    number: String,
    status: String,
    equipment: String,
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client'
    },
    repairMan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employment'
    },
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employment'
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
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