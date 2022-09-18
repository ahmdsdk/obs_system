const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    subject: {
        type: String,
        ref: 'Homework',
        field: 'subject'
    },
    homework: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Homework',
        required: true
    },
    lesson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
        required: true
    },
    question: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum : ['single','multi'],
        default: 'single',
        required: true
    },
    numberOfAnswers: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    }
},
{
    timestamps: true
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;