const mongoose = require("mongoose");
 
const quizResultSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    pdfUrl: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        default: ""
    },
    chapterName: {
        type: String,
        default: ""
    },
    score: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    percentage: {
        type: Number,
        required: true
    },
    attemptedAt: {
        type: Date,
        default: Date.now
    }
});
 
module.exports = mongoose.model("QuizResult", quizResultSchema);