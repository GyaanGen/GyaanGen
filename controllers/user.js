const express = require("express")
const User = require("../models/user")
const validator = require("validator")

const { generateToken } = require("../services/jwtservices")

async function handleUserSignUp(req,res){
    try{
        let {name, email, password} = req.body;

        if(!name || !email || !password){
            return res.status(400).json({
                message: "all fields are required"
            });
        }

        const existingUser = await User.findOne({ email });

        if(existingUser){
            return res.status(400).json({
                message : "user already present"
            });
        }else{

            email = email.trim().toLowerCase();

            if (!validator.isEmail(email)) {
                return res.status(400).json({
                    message: "Invalid email"
                });
            }

            const newUser = await User.create({
                name,
                email,
                password
            });

            const token = generateToken({ id: newUser._id });
            
            res.cookie("token", token);


            return res.status(201).json({
                message : "user successfully signed-up",
                user : newUser,
                token : token
            });

        }
    }
    catch(error){
        console.log("error occured during signup", error);
        return res.status(500).json({
            message : "error occured during signup",
        })
    }
}

async function handleUserLogin(req,res){
    try{

        const {email, password} = req.body;

        const existingUser = await User.findOne({email});

        if(!existingUser){
            return res.status(400).json({
                message : "user not found",
            });
        }

        if(existingUser.password !== password){
            return res.status(400).json({
                message : "invalid credentials",
            })
        }

        const token = generateToken({ id: existingUser._id });
        
        res.cookie("token", token);

        return res.status(200).json({
            message : "user successfully logged in",
            user : existingUser,
            token : token
        });

    }catch(error){
        return res.status(400).json({
            message : "error occures during login",
        })
    }
}

function handleLogOut(req, res){
    res.clearCookie("token");
    return res.status(200).json({
        message : "user successfully logged out ",
    });
}

module.exports = {
    handleUserLogin,
    handleUserSignUp,
    handleLogOut
}