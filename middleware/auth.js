const jwt = require("jsonwebtoken")
const User = require("../models/user")
const { verifyToken } = require("../services/jwtservices")

const auth = async (req,res,next) =>{
    try{

        // ── Tell browser NEVER to cache this response ──
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");

        const token  = req.cookies.token;
        if(!token){
            return res.redirect("/user/login");
        }

        const decoded = verifyToken(token);

        const user = await User.findById(decoded.id).select("-password");

        if(!user) return res.redirect("/user/login");

        req.user = user;
        next();

    }catch(error){
        return res.redirect("/user/login");
    }
}

module.exports = auth