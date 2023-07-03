const mongoose = require('mongoose');

const EmploymentSchema = mongoose.Schema({
    name: String,
    email: String,
    phone: [String],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    },
    del: String,
}, {
    timestamps: true
});


const Employment = mongoose.model('EmploymentZakajiKz', EmploymentSchema);

module.exports = Employment;