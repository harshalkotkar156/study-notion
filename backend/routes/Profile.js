const express = require("express");
const router = express.Router();

const {updateProfile,
    deleteAccount,
    getUserDetails,
    instructorDashboard,
    getEnrolledCourses,
    updateDisplayPicture,
    } = require("../controllers/Profile");

const {auth,isInstructor} = require("../middleware/auth");
// const { updateDisplayPicture } = require("../../frontend/src/services/operations/SettingAPI");
router.put('/update-profile' ,auth, updateProfile);
router.delete('/delete-profile' ,auth, deleteAccount);
router.get('/get-user-details' ,auth, getUserDetails);
router.get('/instructor-dashboard' ,auth,isInstructor, instructorDashboard);
router.get('/enrolled-courses' ,auth, getEnrolledCourses);
router.put("/update-display-picture",auth,updateDisplayPicture);
module.exports=router;