const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const auth = require("../middleware/auth"); // protect the route
const { handleNoteLoading, handleNoteMaking } = require("../controllers/notes");

router.get("/", auth, (req, res) => {
    const data = JSON.parse(
        fs.readFileSync(path.join(__dirname, "../public/books.json"), "utf-8")
    );

    const userClass = req.user.userClass;  // ✅ from DB
    const name = req.user.name;        // ✅ from DB

    const subjects = [
        ...new Set(
            data
                .filter(item => item.level === userClass)
                .map(item => JSON.stringify({ subject: item.subject, language: item.language }))
        )
    ].map(item => JSON.parse(item));  // ✅ unique subject+language combos

    res.render("home", { subjects, name, activeTab: "home" });
});


router.get("/subject", auth, (req, res) => {
    const subjectName = req.query.name;

    const data = JSON.parse(
        fs.readFileSync(path.join(__dirname, "../public/books.json"), "utf-8")
    );

    const userClass = req.user.userClass;

    const subjectData = data.find(
        item => item.subject === subjectName && item.level === userClass
    );

    if (!subjectData) return res.send("No data found");

    if (subjectData.books.length === 1) {
        return res.render("chapters", {
            chapters: subjectData.books[0].chapters,
            subject: subjectName,
            book : subjectData.books[0].name,
            bookCount: subjectData.books.length
        });
    } else {
        return res.render("books", {
            books: subjectData.books,
            subject: subjectName,
        });
    }
});


router.get("/chapters", auth, (req, res) => {
    const { subject, book } = req.query;

    const data = JSON.parse(
        fs.readFileSync(path.join(__dirname, "../public/books.json"), "utf-8")
    );

    const userClass = req.user.userClass;

    const subjectData = data.find(
        item => item.subject === subject && item.level === userClass
    );

    if (!subjectData) return res.send("No subject found");

    const bookData = subjectData.books.find(
        b => b.name.trim() === book.trim()
    );

    if (!bookData) return res.send("No book found");

    res.render("chapters", {
        chapters: bookData.chapters,
        subject,
        book,
        bookCount: subjectData.books.length
    });
});

router.get("/reader", auth, (req, res) => {
    const pdf = req.query.pdf;
    res.render("reader", { pdf });
});

router.get("/reader/notes",auth, handleNoteLoading);
router.post("/reader/notes",auth, handleNoteMaking);

module.exports = router;