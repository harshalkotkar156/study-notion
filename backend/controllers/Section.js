const Course = require("../models/Course");
const Section = require("../models/Section");



exports.createSection = async(req,res) => {
    try{
        const {sectionName,courseId} = req.body;

        if(!sectionName || !courseId) {
            return res.status(400).json({
                success:false,
                message : "All details are required"
            });
        }

        const newSection = await Section.create({sectionName});
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            {
                $push: { courseContent: newSection._id },
            },
            { new: true }
        )
            .populate({
                path: "courseContent",      // populate Section
                populate: {
                    path: "subSection",       // populate SubSection inside Section
                },
            })
            .exec();

        return res.status(200).json({
            success:true,
            message : "Section created successfully",
            updatedCourse
        });

    }catch(error){
        return res.status(503).json({
            success:false,
            message : "Error in section creation",
            error :error.message
        });
    }
}

exports.updateSection = async (req, res) => {
	try {
		const { sectionName, sectionId,courseId } = req.body;
		const section = await Section.findByIdAndUpdate(
			sectionId,
			{ sectionName },
			{ new: true }
		);

		const course = await Course.findById(courseId)
		.populate({
			path:"courseContent",
			populate:{
				path:"subSection",
			},
		})
		.exec();

		res.status(200).json({
			success: true,
			message: section,
			data:course,
		});
	} catch (error) {
		console.error("Error updating section:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

exports.deleteSection =async(req,res) => {
    try {
        // id collected through the parameters
        
        const {sectionId,courseId} =req.body;
        await Course.findByIdAndUpdate(courseId, 
            {
                $pull: { 
                    courseContent: sectionId 
                }
            }
        );



        await Section.findByIdAndDelete(sectionId);

        return res.status(200).json({
            success:true,
            message : "Section deleted successfully"
        });


        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message : "Error in deleting Section, Try Again!",
        });
    }
}