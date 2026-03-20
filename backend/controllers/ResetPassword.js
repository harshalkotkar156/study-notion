const crypto = require("crypto");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
require("dotenv").config();

const bcrypt = require("bcrypt");


exports.resetPasswordToken = async (req, res) => {

    try {

        const { email } = req.body;
        if (!email) {
            return res.status(403).json({
                success: false,
                message: "All fields are required"
            });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({
                success: false,
                message: "User is not Registered with this email"
            });
        }

        const token = crypto.randomUUID();
        const updatedDetails = await User.findOneAndUpdate(
            { email: email },
            { token: token, resetPasswordExpires: Date.now() + 5 * 60 * 1000 },
            { new: true }
        );


        const url = `${process.env.FRONTEND_URL}update-password/${token}`;

        await mailSender(email, "Password Reset Link", `Password Reset Link : ${url}`);

        return res.status(200).json({
            success: true,
            message: "Password Reset Sucessfully,check Email"
        });


    } catch (error) {
        console.log("error in reseting password");

        return res.status(500).json({
            success: false,
            message: "Error in Reseting password"
        });
    }
}


exports.resetPassword = async (req, res) => {

    try {

        const { token, password, confirmPassword } = req.body;
        if (password !== confirmPassword) {
            return res.json({
                success: false,
                message: "Password not matching"
            });
        }


        if (!token || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }


        const userDetails = await User.findOne({ token: token });
        if (!userDetails) {
            return res.json({
                success: false,
                message: "Token is Invalid"
            });
        }

        if (userDetails.resetPasswordExpires < Date.now()) {
            return res.json({
                success: false,
                message: "Token is Expired, Try again!"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.findOneAndUpdate(
            { token: token },
            { password: hashedPassword },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Password reset successfully"
        });





    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error in Resetting password"
        });
    }
}