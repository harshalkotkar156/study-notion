const express = require("express");
const app = express();
require("dotenv").config();


const cookieParser = require('cookie-parser');
const cors = require("cors");
const {cloudinaryConnect} = require("./config/cloudinary");
const fileUpload = require("express-fileupload")
const database = require("./config/database");
const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
// const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/CourseRoutes");



const PORT = process.env.PORT || 3000;

database.connect();


app.use(cookieParser());
app.use(express.json());
app.use(
    cors({
        origin:process.env.FRONTEND_URL,
        credentials:true
    })
)

app.use(
    fileUpload({
        useTempFiles:true,
        tempFileDir:"/tmp"})
)


cloudinaryConnect();


app.use("/api/v1/auth",userRoutes);
app.use("/api/v1/course",courseRoutes);
app.use("/api/v1/profile",profileRoutes);
// app.use("/api/v1/payment",paymentRoutes);


app.get("/api/v1/health" ,(req,res) => {
    console.log("Server is working");
    return res.status(200).json({
        success:true,
        message : "Server is working"
    });
})


app.listen(PORT ,() => {
    console.log(`Server Started on PORT: ${PORT} `);
})
