const mongoose = require('mongoose');

const FormSchema = mongoose.Schema({
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    },
    templateForm: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TemplateForm'
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client'
    },
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employment'
    },
    questions: [{
        formType: String,
        question: String,
        answer: [String],
        answers: [String],
        obligatory: Boolean
    }]
}, {
    timestamps: true
});


const Form = mongoose.model('FormZakajiKz', FormSchema);

module.exports = Form;