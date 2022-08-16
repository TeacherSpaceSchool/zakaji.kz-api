const mongoose = require('mongoose');

const ErrorAzykSchema = mongoose.Schema({
    err: String,
    path: String,
}, {
    timestamps: true
});

const ErrorAzyk = mongoose.model('ErrorAzyk', ErrorAzykSchema);

module.exports = ErrorAzyk;