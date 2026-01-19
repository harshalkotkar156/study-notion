const express = require("express");
const app = express();
require("dotenv").config();

const database = require("./config/database");
const PORT = process.env.PORT || 3000;
database.connect();

app.listen(PORT ,() => {
    console.log(`Server Started on PORT: ${PORT} `);
})
