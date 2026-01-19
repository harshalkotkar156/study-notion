const mongoose= require('mongoose');
require('dotenv').config();

const MONGODB_URL = process.env.MONGODB_URL;


exports.connect = () => {
    mongoose.connect(MONGODB_URL,{

    }).then( () => {
        console.log("DB connected Successfully");
    }).catch((err) => {
        console.log("Error in database Connection " , err);
        process.exit(1);
        
    })
}

