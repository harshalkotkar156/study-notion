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
        res.status(200).json({
            success:true,
            message:"All tags returned sucessFully",
            allTags
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message : "Error in showing all messages"
        });
    }
}
