const mongoose = require('mongoose');

const BlogSchema = mongoose.Schema({
    title: String,
    text: String,
    image: String,
}, {
    timestamps: true
});


const Blog = mongoose.model('BlogZakajiKz', BlogSchema);

module.exports = Blog;