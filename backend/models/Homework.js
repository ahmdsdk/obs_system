const mongoose = require('mongoose');

const homeworkSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    subject: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    lesson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson'
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher'
    },
    date: {
        type: Date,
        default: Date.now()
    }
},
{
    timestamps: true
});

const Homework = mongoose.model('Homework', homeworkSchema);

module.exports = Homework;