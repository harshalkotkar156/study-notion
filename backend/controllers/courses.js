const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const {uploadImageCloudinary} = require("../utils/imageUploder");
const CourseProgress = require("../models/CourseProgress");
const {convertSecondsToDuration} = require("../utils/durationCalculator");
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");


exports.editCourse = async (req, res) => {
  try {
    const { courseId } = req.body
    const updates = req.body
    console.log("this is body : ",req.body);
    const course = await Course.findById(courseId)

    if (!course) {
      return res.status(404).json({ error: "Course not found" })
    }

    // If Thumbnail Image is found, update it
    if (req.files) {
      console.log("thumbnail update")
      const thumbnail = req.files.thumbnailImage
      const thumbnailImage = await uploadImageCloudinary(
        thumbnail,
        process.env.FOLDER_NAME
      )
      course.thumbnail = thumbnailImage.secure_url
    }

    // Update only the fields that are present in the request body
   Object.keys(updates).forEach((key) => {
  if (key === "tag" || key === "instructions") {
    course[key] = JSON.parse(updates[key])
  } else {
    course[key] = updates[key]
  }
})


    await course.save()

    const updatedCourse = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()

    res.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

exports.createCourse = async(req,res) => {
    try{

      
        const {courseName,whatYouWillLearn,courseDescription,price,category,tag} = req.body;

        const thumbnail = req.files.thumbnailImage;

        if(!courseName || !courseDescription || !price || !category || !thumbnail || !whatYouWillLearn){

            return res.status(400).json({
                success:false,
                message : "All fields are required"
            });
        }

        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message : "Instructor Details NOT found"
            });
        }

        const categoryDetails = await Category.findById(category);//here tag was passed as ID

        if(!categoryDetails){
            return res.status(404).json({
                success:false,
                message : "Category details NOT Found"
            });
        }
        const thumbnailImage =await uploadImageCloudinary(thumbnail,process.env.CLOUDINARY_FOLDER_NAME);

        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor:instructorDetails._id,
            whatYouWillLearn,
            price,
            category:categoryDetails._id,
            thumbnail:thumbnailImage.secure_url,
            tag : tag
        });

        await User.findByIdAndUpdate(
            {_id :instructorDetails._id},
            {
                $push :{
                    courses:newCourse._id,
                }
            },
            {new:true}
        )
        
        await Category.findByIdAndUpdate(
            {_id: categoryDetails._id},
            {
                $push: {
                    course:newCourse._id,
                }
            }
        )


        return res.status(200).json({
            success:true,
            message : "New course created Successfully",
            data : newCourse
        });

    }catch(error) {
        return res.status(500).json({
            success:false,
            message : "Error occured while creating course",
            error : error.message
        });
    }
}




//hadnler for getting all the courses
exports.showAllCourses = async(req,res) => {


    try {
        const allCourses = await Course.find({},
            {
                courseName : true,
                price:true,
                thumbnail:true,
                instructor:true,
                ratingAndReviews:true,
                studentEnrolled:true,

            }
        ).populate("instructor").exec(); 


        return res.status(200).json({
            success:true,
            message : "Courses Data retrived successfully",  
            data:allCourses
        });





    } catch (error) {
        return res.status(500).json({
            success:false,
            message : "Error in fetching Courses"
        });
    }
}


exports.getCourseDetails = async (req,res) => {
    try {
        
        const { courseId } = req.body; 


        if(!courseId){
            return res.status(400).json({
                success:false,
                message : "All fields are required"
            });
        }

        const courseDetails = await Course.findById(courseId)
            .populate(
                {
                    path:"instructor",
                    populate:{
                        path : "additionalDetails"
                    }   
                }
            ) 
            .populate("category")
            .populate("studentEnrolled")
            .populate("ratingAndReviews")
            .populate({
                path: "courseContent",
                populate: {
                path: "subSection",
                },
        });

        if(!courseDetails){
            return res.status(404).json({
                success:false,
                message : "No course found",
                  
            });
        }
        courseDetails.instructor.password =undefined;

        return res.status(200).json({
            success: true,
            message: "Course details fetched successfully",
            data: courseDetails,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error while fetching course details",
            error: error.message,
        });
    }
}


exports.getFullCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body
    const userId = req.user.id
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()

    let courseProgressCount = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    })

    console.log("courseProgressCount : ", courseProgressCount)

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      })
    }

    // if (courseDetails.status === "Draft") {
    //   return res.status(403).json({
    //     success: false,
    //     message: `Accessing a draft course is forbidden`,
    //   });
    // }

    let totalDurationInSeconds = 0
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration)
        totalDurationInSeconds += timeDurationInSeconds
      })
    })

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
        completedVideos: courseProgressCount?.completedVideos
          ? courseProgressCount?.completedVideos
          : [],
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}


exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body
    const userId = req.user.id;

    // Find the course
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }


    // remove that course from the instructor courses as well 
    
    const removeCourseFromInstructor=await User.findByIdAndUpdate(userId,
      {
        $pull : {
          courses:courseId
        }
      },
      {new:true}

    );

    const studentsEnrolled = course.studentEnrolled
    for (const studentId of studentsEnrolled) {
      
      await User.findByIdAndUpdate(studentId, {
        $pull: { courses: courseId },
      })
    }

    //delete the courseid from the instructor as well 


    // Delete sections and sub-sections
    const courseSections = course.courseContent
    for (const sectionId of courseSections) {
      // Delete sub-sections of the section
      const section = await Section.findById(sectionId)
      if (section) {
        const subSections = section.subSection
        for (const subSectionId of subSections) {
          await SubSection.findByIdAndDelete(subSectionId)
        }
      }

      // Delete the section
      await Section.findByIdAndDelete(sectionId)
    }

    // Delete the course
    await Course.findByIdAndDelete(courseId)

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}



exports.getInstructorCourses = async (req, res) => {
  try {
    // Get the instructor ID from the authenticated user or request body
    const instructorId = req.user.id

    // Find all courses belonging to the instructor
    const instructorCourses = await Course.find({
      instructor: instructorId,
    }).sort({ createdAt: -1 })

    // Return the instructor's courses
    res.status(200).json({
      success: true,
      data: instructorCourses,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve instructor courses",
      error: error.message,
    })
  }
}