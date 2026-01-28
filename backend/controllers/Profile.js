const Profile = require("../models/Profile");
const User= require("../models/User");
const Course = require("../models/Course");
const CourseProgress = require("../models/CourseProgress");

exports.updateProfile = async(req,res) => {
    try {
        const {gender , dateOfBirth="" , about="",contactNumber} = req.body;
        const userId = req.user.id;
        if(!contactNumber || !userId || !gender){
            return res.status(400).json({
                success:false,
                message : "All details are required"
            });
        }

        const userDetails = await User.findById(userId);
        const profileId = userDetails.additionalDetails;

        const updatedProfile = await Profile.findByIdAndUpdate(profileId,
            {
                gender : gender,
                contactNumber:contactNumber,
                about:about,
                dateOfBirth : dateOfBirth,
            },
            {new:true}
        );

        return res.status(200).json({
            success:true,
            message : "Profile Updated successfully",
            updatedProfile
        });



    } catch (error) {
        return res.status(500).json({
            success:false,
            message : "Error in Updating profile"
        });
    }

}


exports.deleteAccount = async(req,res) => {
    try {
        const {id} = req.body;
        if(!id){
            return res.status(400).json({
                success:false,
                message : "All details are required"
            });
        }

        const user = await User.findById(id);
        if(!user) {
            return res.status(404).json({
                success:false,
                message : "User not found"
            });
        }
        const profileId = user.additionalDetails;
        await Profile.findByIdAndDelete(profileId);

        await User.findByIdAndDelete(id);

        return res.status(200).json({
            success:true,
            message : "User deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success:false,
            message : "Error in deleting the profile, try again!"
        });

    }

}

exports.getUserDetails = async(req,res) => {
    try {
        const id= req.user.id;
        if(!id){
            return res.status(404).json({
                success:false,
                message : "All fields are required"
            });
        }
  
        const user = await User.findById(id).populate("additionalDetails");
        user.password=undefined;
        return res.status(200).json({
            success:true,
            message : "User details fetched successfully",
            data:user
        });

    } catch (error) {
        return res.status(500).json({
            success:false,
            message : "Error in fetching user details"
        });
    }
}


exports.instructorDashboard = async (req, res) => {
    try {
  
      const courseDetails = await Course.find({ instructor: req.user.id })
  
      const courseData = courseDetails.map((course) => {
        const totalStudentsEnrolled = course.studentsEnroled.length;
        const totalAmountGenerated = totalStudentsEnrolled * course.price;
  
        // Create a new object with the additional fields
        const courseDataWithStats = {
          _id: course._id,
          courseName: course.courseName,
          courseDescription: course.courseDescription,
          // Include other course properties as needed
          totalStudentsEnrolled,
          totalAmountGenerated,
        }
  
        return courseDataWithStats
      })
  
      res.status(200).json({ courses: courseData })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server Error" })
    }
  }


exports.getEnrolledCourses = async (req, res) => {
try {
    const userId = req.user.id
    
    let userDetails = await User.findOne({_id: userId})
        .populate({
            path: "courses",
            populate: {
            path: "courseContent",
            populate: {
                path: "subSection",
            },
            },
        })
        .exec();
    
    // console.log(userDetails);
    

    userDetails = userDetails.toObject();

    var SubsectionLength = 0
    for (var i = 0; i < userDetails.courses.length; i++) {
    let totalDurationInSeconds = 0
    SubsectionLength = 0
    for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
        totalDurationInSeconds += userDetails.courses[i].courseContent[
        j
        ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
        userDetails.courses[i].totalDuration = convertSecondsToDuration(
        totalDurationInSeconds
        )
        SubsectionLength +=
        userDetails.courses[i].courseContent[j].subSection.length
    }
    let courseProgressCount = await CourseProgress.findOne({
        courseID: userDetails.courses[i]._id,
        userId: userId,
    })
    courseProgressCount = courseProgressCount?.completedVideos.length
    if (SubsectionLength === 0) {
        userDetails.courses[i].progressPercentage = 100
    } else {
        // To make it up to 2 decimal point
        const multiplier = Math.pow(10, 2)
        userDetails.courses[i].progressPercentage =
        Math.round(
            (courseProgressCount / SubsectionLength) * 100 * multiplier
        ) / multiplier
    }
    }

    if (!userDetails) {
    return res.status(400).json({
        success: false,
        message: `Could not find user with id: ${userDetails}`,
    })
    }
    return res.status(200).json({
    success: true,
    data: userDetails.courses,
    });

} catch (error) {
    return res.status(500).json({
    success: false,
    message: error.message,
    })
}
}
