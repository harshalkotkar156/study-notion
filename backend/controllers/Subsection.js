const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const uploadImageCloudinary = require("../utils/imageUploder");

exports.createSubSection = async(req,res) => {
    try {
        
        const {title,timeDuration,description,sectionId} = req.body;

        const video = req.file.videoFile;


        if(!title || !timeDuration || !description || !video || !sectionId){
            return res.status(403).json({
                success:false,
                message : "All fields"
            });
        }

        const uploadDetails = await uploadImageCloudinary(video,process.env.CLOUDINARY_FOLDER_NAME);


        
        const newSubSection = await SubSection.create({ title, timeDuration, description, videoUrl: uploadDetails.secure_url });

        const updateSectionDetails = await Section.findByIdAndUpdate(
            sectionId,
            {
                $push: { subSection: newSubSection._id },
            },
            { new: true }
        ).populate("subSection");

        
        return res.status(200).json({
            success:true,
            message : "Subsection created Successfully",
            updateSectionDetails
        });




    } catch (error) {
        return res.status(500).json({
            success:false,
            message : "Error in creating subsection"
        });
    }
}


exports.deleteSubSection = async (req,res) => {
    try {
        const {subSectionId , sectionId} = req.params;

        await Section.findByIdAndUpdate (sectionId , 
            {
                $pull : {
                    subSection:subSectionId
                },
            },
            {new : true}
        );

        await SubSection.findByIdAndDelete(subSectionId);

        return res.status(200).json({
            success:true,
            message : "subsection deleted successfully"
        });



    } catch (error) {
        return res.status(500).json({
            success:false,
            message : "Error in deleting subsection"
        });

    }

}


exports.updateSubSection = async (req,res) => {
    try {
        
        const {subSectionId ,title="",timeDuration="",description=""} = req.body;
        if(req.file.videoFile){
            const video = req.file.videoFile;
            const videoUpload = await uploadImageCloudinary(video,process.env.CLOUDINARY_FOLDER_NAME);
            await SubSection.findByIdAndUpdate(subSectionId ,
                {
                    title : title,
                    timeDuration : timeDuration,
                    description : description,
                    videoUrl:videoUpload.secure_url
                }
            )

        }else{
            await SubSection.findByIdAndUpdate(subSectionId ,
                {
                    title : title,
                    timeDuration : timeDuration,
                    description : description,
                }
            );

        }
        return res.status(200).json({
            success:true,
            message : "Subsection updated successfully"
        });


    } catch (error) {
        return res.status(500).json({
            success:false,
            message : "Error in Updating the subsection"
        });
    }

}
