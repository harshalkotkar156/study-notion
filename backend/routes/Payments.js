const express = require("express");
const router = express.Router();


const {auth,isStudent} = require("../middleware/auth");
const {capturePayment,verifyPayment} = require("../controllers/Payments");



router.post('/capture-payment' , auth,isStudent,capturePayment);
router.post('/verify-signature' , auth,isStudent,verifyPayment);

module.exports= router;