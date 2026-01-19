const mongoose = require('mongoose');
const mailSender = require("../utils/mailSender");

const OtpSchema = new mongoose.Schema({

    createdAt:{
        type:Date,
        default:Date.now(),
        expires:5*60
    },
    email:{
        type:String,
        required:true
    },
    otp :{
        type:String,
        required:true 
    }

});

async function sendVerificationMail(email, otp) {
    try{

        const mailResponse = await mailSender(email,'Verification from the StudyNotion' , otp);

        console.log(`Mail send SucessFully : ${mailResponse}`);

    }catch(err){
        console.log("Error occured while sending the mail: ", err);

    }
}

OtpSchema.pre('save', async function(next){
    await sendVerificationMail(this.email,this.otp);  
    next();
})

module.exports = mongoose.model("OTP",OtpSchema);