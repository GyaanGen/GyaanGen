const mongoose = require("mongoose");
 
const progressSchema = new mongoose.Schema({
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
    openedAt: {
        type: Date,
        default: Date.now
    }
});
 
module.exports = mongoose.model("Progress", progressSchema);