const express = require("express")
const router = express.Router();
 
const { handleUserSignUp, handleUserLogin, handleLogOut } = require("../controllers/user")

router.get("/login", (req,res) =>{
    const token = req.cookies.token;
    if (token) return res.redirect("/home");

    res.setHeader("Cache-Control", "no-store");
    return res.render("login", { error: null });
})
router.get("/signup",(req,res) =>{
    const token = req.cookies.token;
    if (token) return res.redirect("/home");

    res.setHeader("Cache-Control", "no-store");
    return res.render("signup", { error: null });
})

router.post("/signup", handleUserSignUp)
router.post("/login", handleUserLogin)
router.post("/logout", handleLogOut)

module.exports = router