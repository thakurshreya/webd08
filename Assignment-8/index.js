const express = require("express");
const bcrypt = require("bcrypt");
const app = express();
const mongoose = require("mongoose");

const router = require("./src/routes/routes");

mongoose.connect(
  "mongodb+srv://bizthakurshreya:BLpu2h4ZGYenUOqJ@cluster0.ui7kp.mongodb.net/Users?retryWrites=true&w=majority&appName=Cluster0"
);

app.use(express.json());

app.use(router);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
