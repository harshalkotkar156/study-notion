const { Mongoose } = require("mongoose");
const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");


exports.capturePayment = async(req,res) => {

    const {courses} = req.body;
    console.log("THis are courses in backend :",courses);
    const userId = req.user.id;
    if(courses.length === 0) {
        return res.json({
            success:false,
            message : "Please provide course id"
        });
    }
    let totalAmt = 0;
    for(const courseId of courses){
        let course;
        try {
            course = await Course.findById(courseId);
            if(!course){
                return res.status(200).json({
                    success:true,
                    message : "No course found"
                });
            }
            const uid = new Mongoose.Types.ObjectId(userId);
            if(course.studentEnrolled.includes(uid)){
                return res.status(200).json({
                    success:false,
                    message : "Student is already enrolled"
                });
            }
            totalAmt += course.price;

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success:false,
                message : error.message
            });

        }


    }

    const options = {
        amount : totalAmt * 100,
        currency : "INR",
        receipt : Math.random((Date.now())).toString(),
    }

    try {
        const paymentResponse = await instance.orders.create(options);
        res.json({
            success:true,
            message : paymentResponse
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message : "Could not initiate order"
        });        
    }
}


exports.verifyPayment = async(req,res) => {
    const razorpay_order_id = req.body?.razorpay_order_id;
    const razorpay_payment_id = req.body?.razorpay_payment_id;
    const razorpay_signature = req.body?.razorpay_signature;
    const courses = req.body?.courses;
    const userId = req.user.id;

    if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courses || !userId){

        return res.status(200).json({
            success:false,
            message : "Payment failed"
        });

    }
    let body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac("sha256".   process.env.RAZORPAY_KEY_SECRET).update(body.toString()).digest('hex');

    if(expectedSignature === actual_signature){

        await enrolledStudents(courses,userId,res);
        return res.status(200).json({
            success:true,
            message : "Payment Verified"
        });
    }
    return res.status(200).json({
        success:false,
        message : '"Payment failed'
    });
    
}

const enrolledStudents = async(courses,userId,res) => {
     
    if(!courses || !userId || !res){
        return res.status(400).json({
            success:false,
            message:"Please provide data for courses or userid"
        })
    }

    for(const courseId of courses){
        try {
            const enrolledCourse = await Course.findOneAndUpdate(
            {_id:courseId},
            {$push : {studentEnrolled:userId}},
            {new:true},

        )

            if(!enrolledCourse){
                res.status(500).json({
                    success:false,
                    message:"Course not found"
                })
            }

            //finding the student and ad the course to their list of enrolled courses
            const enrolledStudent= await User.findByIdAndUpdate(userId,
                {
                    $push:{
                        courses:courseId
                    }
                }
            ,{new:true})


            // send the confirmation mail now 

            const emailResponse = await mailSender(enrolledStudent.email,`Sucessfully Enrolled into ${enrolledCourse.courseName}`, enrolledCourse.courseName, `${enrolledStudent.firstName}`)  
            
        } catch (error) {
            
            console.log("error ",error);
            return res.status(500).json({
                success:false,
                message : error.message
            });

        }


    }
}
