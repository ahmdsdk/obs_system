const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    lessonCode: {
        type: 'String',
        required: true,
        lowercase: true,
        unique: true
    },
    hasPrerequisite: {
        type: Boolean,
        default: false
    },
    prerequisiteId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson'
    }],
    prerequisiteCode: [{
        type: String,
        ref: 'Lesson',
        field: 'lessonCode'
    }],
    classNo: {
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
    status: {
        type: String, 
        enum: ['pending', 'active', 'inactive', 'canceled'],
        default: 'active'
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