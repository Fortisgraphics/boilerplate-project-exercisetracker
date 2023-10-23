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
app.use(express.urlencoded({ extended: false }));
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
app.post("/api/users/:_id/exercises", async (req, res) => {
  try {
    const userId = req.body[":_id"] || req.body._id;
    const user = await User.findOne({ _id: userId });
    const { description, duration, date } = req.body;

    if (user) {
      const newExercise = {
        userId: userId,
        description: description,
        duration: duration,
        date: date ? new Date(date).toDateString() : new Date().toDateString(),
      };

      const CreatedEx = await Exercise.create(newExercise);

      return res.status(200).json({
        username: user.username,
        description: CreatedEx.description,
        duration: CreatedEx.duration,
        date: CreatedEx.date,
        _id: userId,
      });
    } else {
      return res.status(400).json({ message: "user with id not found" });
    }
  } catch (e) {
    console.log(e);
  }
});

// Get list of exercisefrom a User
app.get("/api/users/:_id/logs", async (req, res) => {
  try {
    const { from, to, limit } = req.query;
    const _id = req.params._id;
    const foundUser = await User.findOne({ _id: _id });

    if (foundUser._id) {
      const { username, _id } = foundUser;
      let userExercises = await Exercise.find({ userId: _id });

      if (from) {
        let pastDate = new Date(from);
        userExercises = userExercises.filter(
          (exercise) => new Date(exercise.date) >= pastDate,
        );
      }
      if (to) {
        let presentDate = new Date(to);
        userExercises = userExercises.filter(
          (exercise) => new Date(exercise.date) <= presentDate,
        );
      }
      if (limit) {
        userExercises = userExercises.splice(0, Number(limit));
      }

      const count = userExercises.length;

      let exerciseList = userExercises.map(
        ({ description, duration, date }) => {
          return {
            description: description,
            duration: duration,
            date: date,
          };
        },
      );

      return res.status(200).json({
        username: username,
        count: count,
        _id: _id,
        log: exerciseList,
      });
    } else {
      return res.status(400).json({ message: "User Not Found" });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ Error: "Could not Load Data" });
  }
});

// Getting the list of all users
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({});
    return res.status(200).json(users);
  } catch (e) {
    console.log(e);
  }
});

// Getting the list of all exercise

app.get("/api/exercises", async (req, res) => {
  try {
    const exercises = await Exercise.find({});
    return res.status(200).json(exercises);
  } catch (e) {
    console.log(e);
  }
});

const listener = app.listen(process.env.PORT || 3005, () => {
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
