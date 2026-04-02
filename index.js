require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = process.env.PORT || 8000;
const connectDB = require("./config/db");
connectDB();

app.get("/", (req, res) => {
    return res.redirect("/home");
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // ✅ needed for reading JWT from cookies
app.use(express.static("public"));
app.set("view engine", "ejs");

app.use("/user", require("./routes/user"));
app.use("/home", require("./routes/home"));
app.use("/practice", require("./routes/practice")); // ✅ practice routes

app.listen(PORT, () => console.log(`Server started at ${PORT}`));