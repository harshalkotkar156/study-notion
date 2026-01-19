const User = require("../models/User");


exports.resetPassword = async(req,res) => {

    try {
        
        

    } catch (error) {
        return res.status(500).json({
            success:false,
            message : "Error in Reseting password"
        });
    }
}