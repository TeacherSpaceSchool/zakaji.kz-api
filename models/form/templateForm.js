const mongoose = require('mongoose');

const TemplateFormSchema = mongoose.Schema({
    title: String,
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationZakajiKz'
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


const TemplateForm = mongoose.model('TemplateFormZakajiKz', TemplateFormSchema);

module.exports = TemplateForm;