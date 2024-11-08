const mongoose = require("mongoose");

const schema = {
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, immutable: true },
  password: { type: String, required: true },
};

module.exports = mongoose.model("user", schema);
