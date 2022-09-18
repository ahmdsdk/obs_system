const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        field: '_id'
    },
    username: {
        type: String,
        ref: 'User',
        field: 'username'
    },
    identityNum: {
        type: Number,
        unique: true,
        required: true
    },
    fullName: {
        type: String,
        ref: 'User',
        field: 'fullName'
    },
    firstName: {
        type: String,
        lowercase: true,
        default: '',
        trim: true
    },
    lastName: {
        type: String,
        lowercase: true,
        default: '',
        trim: true
    },
    status: {
        type: String, 
        enum: ['pending', 'active', 'inactive', 'banned', 'restricted'],
        default: 'pending'
    },
    lesson: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson'
    }],
    homework: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Homework'
    }],
    class: {
        type: Number,
        default: 1
    },
    GPA: {
        type: Number,
        default: 0
    },
    CGPA: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now()
    }
},
{
    timestamps: true
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;