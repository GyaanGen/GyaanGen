const express = require("express")
const router = express.Router();
 
const { handleUserSignUp, handleUserLogin, handleLogOut } = require("../controllers/user")

router.get("/login", (req,res) =>{
    return res.render("login", { error: null })
})
router.get("/signup",(req,res) =>{
    return res.render("signup", { error: null })
})

router.post("/signup", handleUserSignUp)
router.post("/login", handleUserLogin)
router.post("/logout", handleLogOut)

module.exports = router