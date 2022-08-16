const mongoose = require('mongoose');

const FormAzykSchema = mongoose.Schema({
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationAzyk'
    },
    templateForm: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TemplateFormAzyk'
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClientAzyk'
    },
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmploymentAzyk'
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


const FormAzyk = mongoose.model('FormAzyk', FormAzykSchema);

module.exports = FormAzyk;