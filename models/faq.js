const mongoose = require('mongoose');

const FaqSchema = mongoose.Schema({
    url: String,
    title: String,
    video: String,
    typex:  {
        type: String,
        default: 'клиенты'
    },
    civic:  {
        type: String,
        default: 'клиенты'
    },
}, {
    timestamps: true
});

const Faq = mongoose.model('FaqZakajiKz', FaqSchema);

module.exports = Faq;