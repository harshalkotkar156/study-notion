const User = require("../models/User");
const OTP = require("../models/Otp");
const Otpgenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const Profile = require("../models/Profile");
const jwt = require("jsonwebtoken");
// require('dotenv').config();
exports.sentOtp = async (req, res) => {

    try {
        const { email } = req.body;
        const checkUserPresent = await User.findOne({ email });

        if (checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: "User already Registered"
            });
        }

        var otp = Otpgenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        });
        // console.log("Otp generted: ", otp);
        let result = await OTP.findOne({ otp: otp });
        while (result) {
            otp = Otpgenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false
            });
            result = await OTP.findOne({ otp: otp });
        }

        const payload = { email, otp };
        const otpBody = await OTP.create(payload);
        return res.status(200).json({
            success: true,
            message: "Otp sent Successfully",
            otp
        });


    } catch (error) {
        console.log("error in sending otp");
        return res.status().json({
            success: false,
            message: error.message
        });
    }

}




exports.signup = async (req, res) => {

    try {
        const { firstName, lastName, email, password, confirmPassword, accountType, contactNumber, otp } = req.body;

        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {

            return res.status(403).json({
                success: false,
                message: "All fields are required"
            });
        }
       
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords NOT matching"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User is already registered",
            });
        }
        const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        
        if (recentOtp.length == 0) {
            return res.status(400).json({
                success: false,
                message: "Otp NOT found"
            });
        } else if (otp !== recentOtp[0].otp) {
            // wrong otp 
            return res.status(400).json({
                success: false,
                message: "OTP NOT matched"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const profile = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null
        });


        let avatar = firstName[0] + lastName[0];
        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password: hashedPassword,
            accountType,
            additionalDetails: profile._id,
            image: `https://api.dicebear.com/9.x/initials/svg?seed=${avatar}`
        });

        user.password = undefined;

        return res.status(200).json({
            success: true,
            message: "User registered successfully",
            user,
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            error:error.message
        });

    }


}


exports.login = async(req,res) => {
    try {
        
        const {email,password} = req.body;

        if(!email || !password){
            return res.status(403).json({
                success:false,
                message : "All fields are required"
            });
        }

        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success:false,
                message : "User not registered"
            });
        }
        
        if(await bcrypt.compare(password,user.password)){
           const payload = {
                email:user.email,
                id:user._id,
                accountType:user.accountType
            }
            const token = jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:"2h"
            })
            user.token= token;
            user.password=undefined;
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true
            }     

            return res.cookie("token",token,options).status(200).json({
                success:true,
                message:"User Login sucessfully",
                user,
                token
            })

        }else{
            return res.status(401).json({
                success:false,
                message : "Password is Incorrect"
            });
        }





    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Login Failure , Try again",
            error:error.message
        });   
    }
}



exports.changePassword = async(req,res) => {
   try {
         const {email,oldPassword , newPassword,confirmNewPassword} = req.body;
    if(!email || !oldPassword || !newPassword || !confirmNewPassword){
        return res.status(403).json({
            success:false,
            message : "All fields are required"
        });
    }


    if(newPassword !== confirmNewPassword) {
        return res.status(403).json({
            success:false,
            message : "Password not matching"
        });
    }

    const user = await User.findOne({email});
    if(!user){
        return res.status(401).json({
            success:false,
            message : "User Not registered"
        });
    }

    const newPasswordHash = await bcrypt.hash(newPassword,10);
    const updatePassword = await User.updateOne({email:email,
        password : newPasswordHash
    })

    if(!updatePassword){
        return res.status(401).json({
            success:false,
            message : "Password Not Update"
        });
    }
    return res.status(200).json({
        success:true,
        message : "Password changed Successfully"
    });
    

   } catch (error) {
        return res.status(500).json({
            success:false,
            message : "Error in changing Password, Try again!"
        });    
   }
}

