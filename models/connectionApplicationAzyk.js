const mongoose = require('mongoose');

const ConnectionApplicationAzykSchema = mongoose.Schema({
    name: String,
    phone: String,
    address: String,
    whereKnow: String,
    taken: Boolean
}, {
    timestamps: true
});


const ConnectionApplicationAzyk = mongoose.model('ConnectionApplicationAzyk', ConnectionApplicationAzykSchema);

module.exports = ConnectionApplicationAzyk;