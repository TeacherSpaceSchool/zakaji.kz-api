const mongoose = require('mongoose');

const ConnectionApplicationSchema = mongoose.Schema({
    name: String,
    phone: String,
    address: String,
    whereKnow: String,
    taken: Boolean
}, {
    timestamps: true
});


const ConnectionApplication = mongoose.model('ConnectionApplicationZakajiKz', ConnectionApplicationSchema);

module.exports = ConnectionApplication;