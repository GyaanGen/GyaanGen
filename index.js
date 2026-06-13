require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = process.env.PORT || 8000;
const connectDB = require("./config/db");
const fs = require("fs");
const path = require("path");

connectDB();

app.use((req, res, next) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    next();
});

const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000                   // max 100 requests per IP
});

app.use(limiter);

// read ONCE at startup
const booksData = JSON.parse(
    fs.readFileSync(path.join(__dirname, "public", "books.json"), "utf-8")
);
app.locals.booksData = booksData; // available in all routes as req.app.locals.booksData



app.get("/", (req, res) => {
    return res.redirect("/home");
});

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(cookieParser()); // ✅ needed for reading JWT from cookies
app.use(express.static("public"));
app.set("view engine", "ejs");

app.use("/user", require("./routes/user"));
app.use("/home", require("./routes/home"));

// app.use("/practice", (req, res, next) => {
//     console.log("PRACTICE ROUTE HIT:", req.method, req.path);
//     next();
// });
app.use("/practice", require("./routes/practice")); // ✅ practice routes

app.listen(PORT, () => console.log(`Server started at ${PORT}`));