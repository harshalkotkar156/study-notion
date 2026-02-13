const express = require("express");
const router = express.Router();

const {contactUsController}  = require("../controllers/Contact");
const { route } = require("./CourseRoutes");


router.post("/reach/contact" , contactUsController);

module.exports = router;