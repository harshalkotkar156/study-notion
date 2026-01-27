const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const {uploadImageCloudinary} = require("../utils/imageUploder");



exports.createCourse = async(req,res) => {
    try{

        const {courseName,whatYouWillLearn,courseDescription,price,tag} = req.body;
        const thumbnail = req.files.thumbnailImage;

        if(!courseName || !courseDescription || !price || !tag || !thumbnail || !whatYouWillLearn){

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

        const tagDetails = await Category.findById(tag);//here tag was passed as ID

        if(!tagDetails){
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
            tag:tagDetails._id,
            thumbnail:thumbnailImage.secure_url
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
        //here updatethe tag schema as well - so we need to update the and add the course to this tag as well
        await Category.findByIdAndUpdate(
            {tag},
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

    // Find the course
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Unenroll students from the course
    const studentsEnrolled = course.studentsEnroled
    for (const studentId of studentsEnrolled) {
      await User.findByIdAndUpdate(studentId, {
        $pull: { courses: courseId },
      })
    }

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