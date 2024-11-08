const express = require("express");
const router = express.Router();

const monModel = require("../model/user");
const multer = require("multer");
const bcrypt = require("bcrypt");

const storage = multer.diskStorage({
  destination: "images",
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + "." + file.mimetype.split("/")[1]
    );
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/jpeg" ||
      file.mimetype == "image/png" ||
      file.mimetype === "image/jpg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      const err = new Error("Please select only .png,.jpg or .jpeg format");
      err.status = 400;
      return cb(err);
    }
  },
});

router.post("/user/create", async (req, res) => {
  const fullName = req.body.fullName;
  const email = req.body.email;
  const password = req.body.password;

  const checkEmail = await monModel.findOne({ email: email });

  if (checkEmail) {
    return res.status(409).json({ message: "Email ID already exists." });
  }

  if (!/^[a-zA-Z0-9 ]*$/.test(fullName)) {
    return res.status(400).json({ message: "Invalid name" });
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ message: "Invalid email address" });
  }

  if (password.length <= 8) {
    return res
      .status(400)
      .json({ message: "Password must be at least 8 characters long" });
  } else if (
    !/(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&-])/.test(password)
  ) {
    return res.status(400).json({
      message:
        "Password must contain atleast 1 uppercase, 1 lowercase, a digit and a special character.",
    });
  }

  try {
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const encryptedPassword = await bcrypt.hash(password, salt);

    const user = new monModel({
      fullName,
      email,
      password: encryptedPassword,
    });

    await user.save();

    return res.json({ message: "User created successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});

router.put("/user/edit", async (req, res) => {
  const fullName = req.body.fullName;
  const email = req.body.email;
  const password = req.body.password;

  const user = await monModel.findOne({ email: email });

  if (!user) {
    return res.status(400).json({ message: "User Not Found" });
  }

  if (!fullName) {
    return res.status(400).json({ message: "Full Name Is Required." });
  }
  if (!/^[a-zA-Z0-9 ]*$/.test(fullName)) {
    return res.status(400).json({ message: "Invalid Name" });
  }

  if (!password) {
    return res.status(400).json({ message: "Password Is Required." });
  }

  if (password.length < 8) {
    return res
      .status(400)
      .json({ message: "Password must be at least 8 characters long" });
  } else if (
    !/(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&-])/.test(password)
  ) {
    return res.status(400).json({
      message:
        "Password must contain atleast 1 uppercase, 1 lowercase, a number and a special character.",
    });
  }

  try {
    const user = await monModel.findOne({ email: email });

    if (!user) {
      return res.status(400).json({ message: "User Not Found" });
    }
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    user.fullName = fullName;
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    return res
      .status(200)
      .json({ message: "User Details Updated Successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.delete("/user/delete", async (req, res) => {
  const email = req.body.email;

  try {
    const result = await monModel.deleteOne({ email: email });

    if (result.deletedCount === 0) {
      return res.status(400).json({ message: "User Not Found" });
    }

    return res.status(200).json({ message: "User Deleted Successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/user/getAll", async (req, res) => {
  try {
    const allUsers = await monModel.find({}).select("fullName email");
    return res.status(200).json(allUsers);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/user/uploadImage", upload.single("file"), async (req, res) => {
  try {
    return res
      .status(200)
      .json({ message: "File uploaded successfully", path: req.file.path });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
