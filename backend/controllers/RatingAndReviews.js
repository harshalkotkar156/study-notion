const { mongoose } = require("mongoose");
const Course = require("../models/Course");
const RatingandReviews = require("../models/RatingandReviews");

exports.createRating = async(req,res) => {
    try {
        
        const userId = req.user.id;
        const {courseId,review,rating} = req.body;
        if(!userId || !courseId || !review || !rating){
            return res.status(403).json({
                success:false,
                message : "All fields are required"
            });
        }

        const courseDetails = await Course.findOne({
            _id : courseId,
            studentEnrolled : {
                $elemMatch : {$eq : userId}
            }
        });
            
        if(!courseDetails){
            return res.status(404).json({
                success:false,
                message : "Student is not enrolled in the course"
            });
        }
        const alreadyReviewed = await RatingandReviews.findOne({
            user:userId,
            course:courseId
        })

        if(alreadyReviewed){
            return res.status(403).json({
                success:false,
                message : "Course is already reviewed by the User"
            });
        }

        const ratingReviews = await RatingandReviews.create({
            rating:rating,
            reviews:review,
            course : courseId,
            user:userId  
        });

        await Course.findByIdAndUpdate(courseId , 
            {
                $push : {
                    ratingAndReviews : ratingReviews._id
                }
            },
            {new:true}
        );

        return res.status(200).json({
            success:true,
            message : "Rating and review added successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success:false,
            message : "Error in creating Rating and Review"
        });
        
    }
}



exports.averageRating = async(req,res) => {
    try {
        
        const courseId = req.body.courseId;

        

        const result = await RatingandReviews.aggregate([ 
            {
                $match: {
                    course: new mongoose.Types.ObjectId(courseId)
                }
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" }
                }
            }
        ]);

        

        if(result.length > 0){
            return res.status(200).json({
                success:true,
                message : "Average rating fetched Successfully",
                averageRating : result[0].averageRating,
            });
        }

        return res.status(200).json({
            success:true,
            message : "No rating given till now",
            averageRating:0
        });





    } catch (error) {
        return res.status(500).json({
            success:false,
            message : "Error in calculating Average rating",
            error:error.message
        });
    }
}


exports.getRatingAndReviewsAll = async(req,res) => {
    try {
        
        
        const allReviewsandRating = await RatingandReviews.find({})
        .sort({rating:"desc"})
        .populate({path:"user",
            select: "firstName lastName email image", 
        })
        .populate({
            path:"course",
            select:"courseName",
        }).exec();


        return res.status(200).json({
            success:true,
            message : "All reviews fetched successfully",
            data:allReviewsandRating
        });
 

    } catch (error) {
        return res.status(500).json({
            success:false,
            message : "Error in Fetching all Rating and Reviews "
        });
    }
}
