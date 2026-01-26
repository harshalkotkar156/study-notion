const express = require("express");
const router = express.Router();


const {login , sentOtp ,signup,changePassword } = require("../controllers/Auth");

const {resetPasswordToken,resetPassword} = require("../controllers/ResetPassword");

const {auth} = require("../middleware/auth");


router.post("/login",login);

router.post("/sent-otp",sentOtp);

router.post("/signup",signup);

router.post("/change-password",auth,changePassword);



router.post('/reset-password-token' , resetPasswordToken);

router.post('/reset-password' , resetPassword);


module.exports = router;