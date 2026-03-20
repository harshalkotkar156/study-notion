const jwt = require("jsonwebtoken");

const User = require("../models/User");


exports.auth = async(req,res,next) => {

    try {
        const token =
            req.cookies?.token ||
            req.body?.token ||
            req.header("Authorization")?.replace("Bearer ", "");

        // console.log("this is token : ",token);
        if(!token) {
            return res.status(401).json({
                success:false,
                message : "Token is missing "
            });
        }

        try {
            const decode =  jwt.verify(token,process.env.JWT_SECRET);
            req.user = decode;

        } catch (error) {
            // console.log("here is error token is expired");
            // console.log("errror : ",error);
            return res.status(401).json({
                success:false,
                message : "Invalid token",
                error:error.message
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

        next(); 

        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message : "User Role cannot be verified"
        });
    }
}



exports.isAdmin = async(req,res,next) => {
    try {
        
        if(req.user.accountType !== "Admin"){
            return res.status(401).json({
                success:false,
                message : "This is proected route for Admin"
            });
        }
        next();
        
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message : "User Role cannot be verified"
        });
    }
}



exports.isInstructor = async(req,res,next) => {
    try {
        
        if(req.user.accountType !== "Instructor"){
            return res.status(401).json({
                success:false,
                message : "This is proected route for Instructor"
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success:false,
            message : "User Role cannot be verified"
        });
    }
}
