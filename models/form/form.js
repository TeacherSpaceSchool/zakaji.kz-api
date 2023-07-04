const mongoose = require('mongoose');

const FormSchema = mongoose.Schema({
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationZakajiKz'
    },
    templateForm: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TemplateFormZakajiKz'
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClientZakajiKz'
    },
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmploymentZakajiKz'
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