const mongoose = require('mongoose');

const PlanSchema = mongoose.Schema({
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationZakajiKz'
    },
    target: {
        type: Number,
        default: 0
    },
    added: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Plan = mongoose.model('PlanZakajiKz', PlanSchema);

module.exports = Plan;