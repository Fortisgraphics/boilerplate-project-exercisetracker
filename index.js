const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// Getting the Modules
const User = require("./models/user");
const Exercise = require("./models/exercise");

app.use(cors());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// We create a new user by sending a post with /api/users

app.post("/api/users", async (req, res) => {
  try {
    if (!req.body.username) {
      return res.status(401).json({ message: "no User name found" });
    }
    const newUser = await User.create({
      username: req.body.username,
    });
    return res.status(200).json(newUser);
  } catch (e) {
    res.status(500).json({ message: "error user not created" });
  }
});

// We add an exercises to by a user, that was create or existed already
app.post("/api/users/:id/exercises", async (req, res) => {
  try {
    const userId = req.body[":_id"] || req.body._id;
    let user = await User.findById({ _id: userId });
    const date = req.body.date;
    let currentDate = new Date().toDateString();

    if (date) {
      currentDate = new Date(date).toDateString();
    }

    if (user) {
      const newExercise = new Exercise({
        username: user.username,
        description: req.body.description,
        duration: req.body.duration,
        date: currentDate,
      });

      newExercise.save();
      return res.status(200).json({
        _id: userId,
        username: newExercise.username,
        description: newExercise.description,
        duration: newExercise.duration,
        date: newExercise.date,
      });
    } else {
      return res.status(402).json({ message: "user with id not found" });
    }
  } catch (e) {
    console.log(e);
  }
});

// Get list of exercisefrom a User
app.get('/api/users/:_id/logs', (req, res)=>{
  try{
    const {id} = req.params;
    const userExercise = await Exercise.findById({_id: id})

  } catch(e){

  }
})



// Getting the list of all users
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({});
    return res.status(200).json(users);
  } catch (e) {}
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

mongoose
  .connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Your application in working");
  })
  .catch((e) => {
    console.log("Mongoose error", e);
  });
