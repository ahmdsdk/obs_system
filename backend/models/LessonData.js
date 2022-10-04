const mongoose = require('mongoose');

const lessonDataSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    description: {
        type: String,
        required: true,
        lowercase: true
    },
    pdfFiles: [{
        type: String,
        lowercase: true
    }],
    date: {
        type: Date,
        default: Date.now()
    }
},
{
    timestamps: true
});

const LessonData = mongoose.model('Lesson', lessonDataSchema);

module.exports = LessonData;