const Progress   = require("../models/progress");
const QuizResult = require("../models/quizResult");
 
async function handleProfilePage(req, res) {
    try {
        const userId = req.user._id;
        const user   = req.user;
 
        // ── Chapters read (unique PDFs opened) ──
        const allProgress = await Progress.find({ userId }).sort({ openedAt: -1 });
        const uniqueChapters = [...new Map(allProgress.map(p => [p.pdfUrl, p])).values()];
        const chaptersRead = uniqueChapters.length;
 
        // ── Quiz results ──
        const quizResults = await QuizResult.find({ userId }).sort({ attemptedAt: -1 });
        const totalQuizzes = quizResults.length;
        const avgScore = totalQuizzes > 0
            ? Math.round(quizResults.reduce((sum, r) => sum + r.percentage, 0) / totalQuizzes)
            : 0;
 
        // ── Streak calculation ──
        // Get all unique dates the user opened any chapter
        const activityDates = [
            ...new Set(
                allProgress.map(p =>
                    new Date(p.openedAt).toISOString().split("T")[0]
                )
            )
        ].sort((a, b) => new Date(b) - new Date(a)); // newest first
 
        let streak = 0;
        const today = new Date().toISOString().split("T")[0];
 
        if (activityDates.length > 0) {
            // start from today or yesterday
            let expected = today;
            for (const date of activityDates) {
                if (date === expected) {
                    streak++;
                    // go back one day
                    const d = new Date(expected);
                    d.setDate(d.getDate() - 1);
                    expected = d.toISOString().split("T")[0];
                } else {
                    break;
                }
            }
        }
 
        // ── Recent 5 quiz attempts ──
        const recentQuizzes = quizResults.slice(0, 5);
 
        res.render("profile", {
            user,
            chaptersRead,
            totalQuizzes,
            avgScore,
            streak,
            recentQuizzes
        });
 
    } catch (error) {
        console.log("Error loading profile", error);
        return res.redirect("/home");
    }
}
 
async function handleProgressSave(req, res) {
    try {
        const { pdfUrl, subject, chapterName } = req.body;
        const userId = req.user._id;
 
        // Only log if this chapter wasn't opened today already
        const today = new Date();
        today.setHours(0, 0, 0, 0);
 
        const alreadyLogged = await Progress.findOne({
            userId,
            pdfUrl,
            openedAt: { $gte: today }
        });
 
        if (!alreadyLogged) {
            await Progress.create({ userId, pdfUrl, subject, chapterName });
        }
 
        return res.json({ success: true });
 
    } catch (error) {
        console.log("Error saving progress", error);
        return res.json({ success: false });
    }
}
 
async function handleQuizResultSave(req, res) {
    try {
        const { pdfUrl, subject, chapterName, score, total } = req.body;
        const userId = req.user._id;
        const percentage = Math.round((score / total) * 100);
 
        await QuizResult.create({
            userId, pdfUrl, subject, chapterName,
            score, total, percentage
        });
 
        return res.json({ success: true });
 
    } catch (error) {
        console.log("Error saving quiz result", error);
        return res.json({ success: false });
    }
}
 
module.exports = { handleProfilePage, handleProgressSave, handleQuizResultSave };