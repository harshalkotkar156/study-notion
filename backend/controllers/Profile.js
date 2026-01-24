const Profile = require("../models/Profile");
const User= require("../models/User");


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

        return res.status(200).json({
            success:true,
            message : "Detaisl fetched successfully",
            data:user
        });

    } catch (error) {
        return res.status(500).json({
            success:false,
            message : "Error in fetching user details"
        });
    }
}
