const jwt = require("jsonwebtoken");

const User = require("../models/User");


exports.auth = async(req,res,next) => {

    try {
        const token =
            req.cookies?.token ||
            req.body?.token ||
            req.header("Authorization")?.replace("Bearer ", "");


        if(!token) {
            return res.status(401).json({
                success:false,
                message : "Token is missing "
            });
        }

        try {
            const decode =  jwt.verify(token,process.env.JET_SECRET_KEY);
            req.user = decode;

        } catch (error) {
            return res.status(401).json({
                success:false,
                message : "Invalid token"
            });  
        }

        next();

    } catch (error) {
        return res.status(401).json({
            success:false,
            message : "Something went wrong while authenticating"
        });
    }
}


exports.isStudent = async(req,res,next) => {
    try {
        
        if(req.user.accountType !== "Student"){
            return res.status(401).json({
                success:false,
                message : "This is proected route for Student"
            });
        }

        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message : "User Role cannot be verified"
        });
    }
}



exports.isStudent = async(req,res,next) => {
    try {
        
        if(req.user.accountType !== "Admin"){
            return res.status(401).json({
                success:false,
                message : "This is proected route for Student"
            });
        }

        NodeList()
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message : "User Role cannot be verified"
        });
    }
}