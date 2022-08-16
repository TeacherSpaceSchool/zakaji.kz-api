const mongoose = require('mongoose');

const PlanAzykSchema = mongoose.Schema({
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationAzyk'
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

const PlanAzyk = mongoose.model('PlanAzyk', PlanAzykSchema);

module.exports = PlanAzyk;