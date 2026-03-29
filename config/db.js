const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const connectDB = async (req,res) =>{
    try{    
        await mongoose.connect(process.env.mongodb_url);
        console.log("database connected successfully");
    }catch(error){
        console.log("error occured during database connection", error);
    }
}

module.exports = connectDB;