const mongoose = require('mongoose');

const ContactSchema = mongoose.Schema({
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


const Contact = mongoose.model('ContactZakajiKz', ContactSchema);

module.exports = Contact;