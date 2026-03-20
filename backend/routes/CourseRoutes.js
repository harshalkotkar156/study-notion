const express = require("express");
const router = express.Router();


const {createCourse,
    showAllCourses,
    getCourseDetails,
    getFullCourseDetails,
    deleteCourse,
    getInstructorCourses,
    editCourse
    } = require("../controllers/courses");

const {createCategory,
    showAllCategories,
    categoryPageDetails
    } = require("../controllers/Category");

const {createSection,updateSection,deleteSection} =require("../controllers/Section");

const {createSubSection,deleteSubSection,updateSubSection} = require("../controllers/Subsection");


const {createRating,averageRating,getRatingAndReviewsAll} = require("../controllers/RatingAndReviews");

const {auth,isStudent,isInstructor,isAdmin} = require("../middleware/auth");



// courses
router.post("/create-course",auth,isInstructor,createCourse);
router.get("/showall-courses",auth,isInstructor,showAllCourses);
router.post("/get-course-details",getCourseDetails);
router.post("/get-full-course-details",auth,getFullCourseDetails);
router.delete('/delete-course',auth,isInstructor,deleteCourse);
router.get('/instructors-courses',auth,isInstructor,getInstructorCourses);
router.post("/editCourse", auth, isInstructor, editCourse)


//Categories
router.post('/create-category' , auth ,isAdmin,createCategory);
router.get('/showall-categories' , showAllCategories);
router.post("/category-page-details",categoryPageDetails);


//section
router.post('/create-section' , auth,isInstructor,createSection);
router.post('/update-section' , auth,isInstructor, updateSection);
router.post("/delete-section" , auth,isInstructor,deleteSection);


//seb-section
router.post('/create-subsection' ,auth,isInstructor, createSubSection);
router.post('/delete-subsection' ,auth,isInstructor, deleteSubSection);
router.post('/update-subsection' ,auth,isInstructor, updateSubSection);


//rating
router.post("/create-rating",auth,isStudent,createRating);
router.post("/average-create-rating",averageRating);
router.get("/getall-rating-reviews",getRatingAndReviewsAll);


module.exports =router;