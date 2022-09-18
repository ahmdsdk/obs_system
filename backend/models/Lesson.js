const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    hasPrerequisite: {
        type: Boolean,
        default: false
    },
    prerequisite: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson'
    }],
    class: {
        type: Number,
        default: 1
    },
    lessonData: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LessonNote'
    }],
    homework: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Homework'
    }],
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

const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson;