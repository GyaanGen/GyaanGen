const express = require("express")
const router = express.Router();
 
const { handleUserSignUp, handleUserLogin, handleLogOut } = require("../controllers/user")

router.post("/signup", handleUserSignUp)
router.post("/login", handleUserLogin)
router.post("/logout", handleLogOut)

module.exports = router