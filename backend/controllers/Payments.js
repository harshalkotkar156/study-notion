const { Mongoose } = require("mongoose");
const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailsender = require("../utils/mailSender");



exports.capturePayment = async(req,res) => {
    
    const {courseId } = req.body;
    const userId = req.user.id;
    if(!courseId || !userId) {
        return res.status(403).json({
            success:false,
            message : "Please provide course id"
        });
    }
    
    let course;
    try {
        course = await Course.findById(courseId);

        if(!course) {
            return res.json({
                success:false,
                message : "Could NOT find the course"
            });
        }

        //convert the string format userid into the object id
        const uid = new Mongoose.Types.ObjectId(userId);
        
        if(course.studentEnrolled.includes(uid)){
            return res.status(409).json({
                success:false,
                message : "Student is already enrolled"
            });
        } 




    } catch (error) {
        return res.status(500).json({
            success:false,
            message : error.message
        });   
    }



    //create order here
    const amount = course.price;
    const currency = "INR";


    const options = {
        amount : amount*100,
        currency : currency,
        receipt : Math.random(Date.now()).toString(),
        notes : {
            courseId : courseId,
            userId
        }
    };
    try {
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);

        return res.status(200).json({
            success:true,
            message : "Course purchased successfully",
            courseName : course.courseName,
            courseDescription : course.courseDescription,
            thumbnail : course.thumbnail,
            orderId : paymentResponse.id,
            currency:currency,
            amount : paymentResponse.amount
        });



    } catch (error) {
        return res.status(500).json({
            success:false,
            message : error.message,
        });
    }



}


exports.verifySignature  = async(req,res) => {
    const webHookSecret = "12345678";
    const signature = req.headers["x-razorpay-signature"];

    const shaSum = crypto.createHmac("sha256" ,webHookSecret);
    shaSum.update(JSON.stringify(req.body));
    const digest = shaSum.digest("hex");
    if(signature === digest){
        console.log("Payment is Authorized");
        
        const {userId ,courseId}=req.body.payload.payment.entity.notes ;

        try {
            const enrolledCourse = await Course.findByIdAndUpdate(
                {_id : courseId},
                {
                    $push: {
                        studentEnrolled : userId
                    }
                },
                {new : true}
            );
            if(!enrolledCourse){
                return res.status(500).json({
                    success:false,
                    message : "Course Not found ",
                    error : error.message
                });
            }

            const userCoursePurchased = await User.findByIdAndUpdate(
                {_id : userId},
                {
                    $push :{
                        courses:courseId
                    }
                },
                {new :true}
            );

            if(!userCoursePurchased){
                return res.status(500).json({
                    success:false,
                    message : "Student Not found ",
                    error : error.message
                });
            }

            const mailSenderResponse = await mailsender(userCoursePurchased.email,"Congratulations - You are enrolled in new Course" , "You have Successfully purchased a new course ");



            return res.status(200).json({
                success:true,
                message : "Course purchased successfully"
            });


        } catch (error) {
            return res.status(500).json({
                success:false,
                message : error.message
            });
        }


    }else{   
        return res.status(400).json({
            success:false,
            message : "Invalid request"
        });
    }
    



}
