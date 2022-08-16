const mongoose = require('mongoose');

const ContactAzykSchema = mongoose.Schema({
    name: String,
    image: String,
    address: [String],
    email: [String],
    phone: [String],
    info: String,
    warehouse:  {
        type: String,
        default: ''
    },
    social: mongoose.Schema.Types.Mixed,
}, {
    timestamps: true
});


const ContactAzyk = mongoose.model('ContactAzyk', ContactAzykSchema);

module.exports = ContactAzyk;