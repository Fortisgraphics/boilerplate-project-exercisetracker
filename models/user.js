const mongoose = require("mongoose");

// creating your schema and model
const UserSchema = mongoose.Schema({
  username: String,
});

module.exports = mongoose.model("User", UserSchema);
