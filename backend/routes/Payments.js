const express = require("express");
const router = express.Router();


const {auth,isStudent} = require("../middleware/auth");
const {capturePayment,verifySignature} = require("../controllers/Payments");



router.post('capture-payment' , auth,capturePayment);
router.post('verify-signature' , auth,verifySignature);

module.exports= router;