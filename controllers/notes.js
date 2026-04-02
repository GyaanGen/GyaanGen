const Note = require("../models/note");

async function handleNoteLoading(req,res){
    try{

        const userId = req.user._id;
        const {pdfUrl} = req.query;

        const record = await Note.findOne({userId, pdfUrl});

        return res.json({ text : record ? record.text : ""});

    }catch(error){
        console.log("Error fetching note", error);
        return res.json({ text: "" });
    }
}

async function handleNoteMaking(req,res){
    try{
        const { pdfUrl, text } = req.body;
        const userId = req.user._id;

        await Note.findOneAndUpdate(
            { userId, pdfUrl},
            { text, updatedAt: new Date() },
            { upsert: true, new: true }
        )
        return res.json({ success: true, message: "Note saved successfully" });
    
    }catch(error){
        console.log("Error saving note", error);
        return res.json({ success: false, message: "Failed to save note" });
    }
}

module.exports = { handleNoteLoading, handleNoteMaking };