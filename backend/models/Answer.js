const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    homework: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Homework',
        required: true
    },
    question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    },
    answer: {
        type: String,
        required: true,
        trim: true
    },
    correct: {
        type: Boolean,
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

const Answer = mongoose.model('Answer', answerSchema);

module.exports = Answer;