const mongoose = require('mongoose');

const TemplateFormAzykSchema = mongoose.Schema({
    title: String,
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationAzyk'
    },
    editorEmployment: Boolean,
    editorClient: Boolean,
    edit: Boolean,
    questions: [{
        formType: String,
        question: String,
        answers: [String],
        obligatory: Boolean
    }]
}, {
    timestamps: true
});


const TemplateFormAzyk = mongoose.model('TemplateFormAzyk', TemplateFormAzykSchema);

module.exports = TemplateFormAzyk;