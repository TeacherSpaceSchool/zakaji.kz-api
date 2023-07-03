const mongoose = require('mongoose');

const ErrorSchema = mongoose.Schema({
    err: String,
    path: String,
}, {
    timestamps: true
});

const Error = mongoose.model('ErrorZakajiKz', ErrorSchema);

module.exports = Error;