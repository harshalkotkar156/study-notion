const Category = require("../models/Category");
const Course = require('../models/Course');
exports.createCategory = async(req,res) => {

    try {
        const {name,description} = req.body;
        if(!name || !description) {
            return res.status(400).json({
                success:false,
                message : "All fields are required"
            });
        }

        const tagDetails = await Category.create({
            name:name,
            description:description
        });

        console.log(tagDetails);

        return res.status(200).json({
            success:true,
            message : "Tags are created successfully"
        });
        
    }catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message : error.message
        });
    }
}

exports.showAllCategories = async(req,res) =>{

    try {
        
        const allTags = await Category.find({} , {name:true,description:true});
        // console.log("Hello");
        return res.status(200).json({
            success:true,
            message:"All categories returned sucessFully",
            data:allTags
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message : "Error in showing all messages"
        });
    }
}

exports.categoryPageDetails = async(req,res) => {
    try {
        const {categoryId} = req.body;

        const selectedCategory = await Category.findById(categoryId)
            .populate("course").exec();

        if(!selectedCategory){
            return res.status(404).json({
                success:false,
                message : "Data not find"
            });
        }
        const diffrentCategories = await Category.find({
            _id : {$ne : categoryId},
        }).populate("course").exec();
         

    
        const topSellingCourses = await Course.aggregate([
            {
                $addFields: {
                    enrolledCount: { $size: "$studentEnrolled" }
                }
            },
            {
                $sort: { enrolledCount: -1 }
            },
            {
                $limit: 10 
            }
        ]);

        return res.status(200).json({
            success:true,
            message : "Data fetched successfully",
            data: {
                diffrentCategories,
                selectedCategory,
                topSellingCourses
            }
        });




    } catch (error) {
        return res.status(500).json({
            success:false,
            message :error.message
        });        
    }    
}

