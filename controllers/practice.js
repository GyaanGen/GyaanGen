const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function handlePracticeGeneration(req, res) {
    try {
        // ── Receive base64 from client instead of fetching PDF ──
        const { base64Data } = req.body;

        if (!base64Data) {
            return res.json({ success: false, message: "No PDF data received" });
        }

        const prompt = `Act as an expert academic examiner. Analyze the attached PDF and generate a comprehensive question set.
        You must output ONLY a valid JSON object. Do not include any markdown formatting, backticks, or extra text.
        The JSON structure must strictly follow this format:
        {
            "mcqs": [
                { "id": 1, "question": "string", "options": ["full option text 1", "full option text 2", "full option text 3", "full option text 4"], "answer": "must be the exact full text of the correct option, not a letter" }
            ],
            "short_answers": [{ "id": 1, "question": "string", "answer": "ideal answer in 2 to 4 sentences, clear and to the point" }],
            "long_answers":  [{ "id": 1, "question": "string", "answer": "ideal answer in 2 to 3 paragraphs with explanation and examples" }],
            "discussion_questions": [{ "id": 1, "question": "string", "hints": ["key point 1", "key point 2", "key point 3"] }]
        }
        Generate exactly 10 MCQs, 10 short answers, 10 long answers, and 2 discussion questions.`;

        const result = await ai.models.generateContent({
            model: "gemini-2.0-flash",
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
                responseMimeType: "application/json",
                maxOutputTokens: 8192,
                temperature: 0.4
            }
        });

        const questions = JSON.parse(result.text);
        return res.json({ success: true, questions });

    } catch (error) {
        console.log("Error generating questions", error);
        return res.json({ success: false, message: "Failed to generate questions" });
    }
}

module.exports = { handlePracticeGeneration };