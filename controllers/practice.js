const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); // use .env, never hardcode

async function handlePracticeGeneration(req, res) {
    try {
        const { pdfUrl } = req.query;
        
        // 1. Fetch the PDF from the URL
        const response = await fetch(pdfUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Accept": "application/pdf"
            }
        });

        if (!response.ok) throw new Error("Failed to fetch PDF");

        // 2. Convert to base64
        const arrayBuffer = await response.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString("base64");

        // 3. Prompt Gemini
        const prompt = `Act as an expert academic examiner. Analyze the attached PDF and generate a comprehensive question set. 
        You must output ONLY a valid JSON object. Do not include any markdown formatting, backticks, or extra text.
        The JSON structure must strictly follow this format:
        {
            "mcqs": [
                { "id": 1, "question": "string", "options": ["full option text 1", "full option text 2", "full option text 3", "full option text 4"], "answer": "must be the exact full text of the correct option, not a letter" }
            ],
            "short_answers": [{ "id": 1, "question": "string" }],
            "long_answers":  [{ "id": 1, "question": "string" }],
            "discussion_questions": [{ "id": 1, "question": "string" }]
        }
        Generate exactly 10 MCQs, 10 short answers, 10 long answers, and 2 discussion questions.`;

        const result = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite-preview",  // use a stable model name
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
                responseMimeType: "application/json"
            }
        });

        // 4. Parse and send back the questions
        const questions = JSON.parse(result.text);
        return res.json({ success: true, questions });

    } catch (error) {
        console.log("Error generating questions", error);
        return res.json({ success: false, message: "Failed to generate questions" });
    }
}

module.exports = { handlePracticeGeneration };