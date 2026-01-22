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

