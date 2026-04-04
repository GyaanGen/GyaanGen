const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function handleDoubtSolving(req, res) {
    try {
        const { question, subject, chapterName, history, pdfUrl } = req.body;

        // 1. Fetch the PDF
        const pdfResponse = await fetch(pdfUrl, {
            headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/pdf" }
        });

        if (!pdfResponse.ok) throw new Error("Failed to fetch PDF");

        // 2. Convert to base64
        const arrayBuffer = await pdfResponse.arrayBuffer();
        const base64Data  = Buffer.from(arrayBuffer).toString("base64");

        // 3. Build conversation history as text
        const historyText = (history || [])
            .map(h => h.role === "user" ? `Student: ${h.text}` : `Tutor: ${h.text}`)
            .join("\n");

        // 4. Build prompt
        const prompt = `You are a helpful and friendly academic tutor. 
        The student is reading the attached PDF${subject ? ` (Subject: ${subject}${chapterName ? `, Chapter: ${chapterName}` : ""})` : ""}.

        Answer the student's doubt based on the content of this PDF. 
        Be clear, simple, and student-friendly. Use examples if helpful. 
        Keep answers concise but complete.

        ${historyText ? `Previous conversation:\n${historyText}\n` : ""}
        Student: ${question}
        Tutor:`;

        // 5. Send PDF + question to Gemini
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