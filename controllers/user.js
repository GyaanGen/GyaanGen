const User = require("../models/user");
const validator = require("validator");
const bcrypt = require("bcrypt");
const { generateToken } = require("../services/jwtservices");

async function handleUserSignUp(req, res) {
    try {
        let { name, userClass, email, password } = req.body;

        if (!name || !userClass || !email || !password) {
            return res.render("signup", { error: "All fields are required" });
        }

        email = email.trim().toLowerCase();

        if (!validator.isEmail(email)) {
            return res.render("signup", { error: "Enter a valid email address" });
        }

        if (password.length < 6) {
            return res.render("signup", { error: "Password must be at least 6 characters" });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.render("signup", { error: "An account with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            userClass: `class${userClass}`,
            email,
            password: hashedPassword
        });

        const token = generateToken({ id: newUser._id });
        res.cookie("token", token, { httpOnly: true });

        return res.redirect("/home");

    } catch (error) {
        console.log("Error during signup", error);
        return res.render("signup", { error: "Something went wrong. Please try again." });
    }
}

async function handleUserLogin(req, res) {
    try {
        let { email, password } = req.body;

        if (!email || !password) {
            return res.render("login", { error: "Email and password are required" });
        }

        email = email.trim().toLowerCase();

        const existingUser = await User.findOne({ email });


        if (!existingUser) {
            return res.render("login", { error: "No account found with this email" });
        }

        const isMatch = await bcrypt.compare(password, existingUser.password);

        if (!isMatch) {
            return res.render("login", { error: "Incorrect password" });
        }

        const token = generateToken({ id: existingUser._id });
        res.cookie("token", token, { httpOnly: true });

        return res.redirect("/home");

    } catch (error) {
        console.log("Error during login", error);
        return res.render("login", { error: "Something went wrong. Please try again." });
    }
}

function handleLogOut(req, res) {
    res.clearCookie("token");
    return res.redirect("/user/login");
}

module.exports = { handleUserLogin, handleUserSignUp, handleLogOut };