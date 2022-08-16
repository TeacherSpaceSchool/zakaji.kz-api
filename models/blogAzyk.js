const mongoose = require('mongoose');

const BlogAzykSchema = mongoose.Schema({
    title: String,
    text: String,
    image: String,
}, {
    timestamps: true
});


const BlogAzyk = mongoose.model('BlogAzyk', BlogAzykSchema);

module.exports = BlogAzyk;