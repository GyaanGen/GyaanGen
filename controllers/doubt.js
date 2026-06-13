const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function handleDoubtSolving(req, res) {
    try {
        const { question, subject, chapterName, history, base64Data } = req.body;

        if (!question || !base64Data) {
            return res.status(400).json({ success: false, message: "Missing question or PDF data" });
        }

        const recentHistory = (history || []).slice(-10);

        const historyText = recentHistory
            .map(h => h.role === "user" ? `Student: ${h.text}` : `Tutor: ${h.text}`)
            .join("\n");

        const prompt = `You are a helpful and friendly academic tutor. The student is reading the attached PDF${subject ? ` (Subject: ${subject}${chapterName ? `, Chapter: ${chapterName}` : ""})` : ""}.
Format your response using simple HTML tags:
- <b>text</b> for bold
- <i>text</i> for italic
- <br> for new lines
- <ul><li>item</li></ul> for lists
Do NOT use markdown like **bold** or *italic*

STRICT RULES:
- ONLY answer questions related to the attached PDF content or the subject/chapter mentioned
- If the question is unrelated to the syllabus or PDF content, respond EXACTLY with: "I can only help with questions related to your syllabus. Please ask something from your chapter."
- Never answer general knowledge, personal, or off-topic questions
- Never answer questions about people, celebrities, news, or anything outside academics

Answer the student's doubt based on the content of this PDF. Be clear, simple, and student-friendly. Use examples if helpful. Keep answers concise but complete.

${historyText ? `Previous conversation:\n${historyText}\n` : ""}
Student: ${question}
Tutor:`;

        const result = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite-preview",
            contents: [
                prompt,
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: "application/pdf"
                    }
                }
            ],
            generationConfig: {
                maxOutputTokens: 1024,
                temperature: 0.7
            }
        });

        return res.json({ success: true, answer: result.text.trim() });

    } catch (error) {
        console.log("Doubt solving error", error);
        return res.json({ success: false, message: "Failed to get answer. Please try again." });
    }
}

module.exports = { handleDoubtSolving };