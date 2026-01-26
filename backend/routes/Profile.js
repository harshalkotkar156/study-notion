const express = require("express");
const router = express.Router();

const {updateProfile,
    deleteAccount,
    getUserDetails,
    instructorDashboard,
    getEnrolledCourses} = require("../controllers/Profile");

router.put('/update-profile' ,auth, updateProfile);
router.delete('/delete-profile' ,auth, deleteAccount);
router.get('/get-user-details' ,auth, getUserDetails);
router.get('/instructor-dashboard' ,auth, instructorDashboard);
router.get('/enrolled-courses' ,auth, getEnrolledCourses);

module.exports=router;