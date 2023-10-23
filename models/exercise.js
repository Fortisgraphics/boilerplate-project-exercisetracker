const mongoose = require("mongoose");
const exerciseSchema = mongoose.Schema({
  userId: {
    type: String,
    required: [true, "Must include a userId"],
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  date: {
    type: String,
    default: new Date().toDateString(),
  },
});

module.exports = mongoose.model("Exercise", exerciseSchema);
