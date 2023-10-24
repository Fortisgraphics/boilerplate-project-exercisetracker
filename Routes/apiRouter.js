const express = require("express");
const apiRouter = express.Router();
// Getting the Modules
const User = require("../models/user");
const Exercise = require("../models/exercise");

// Getting the list of all users
apiRouter.get("/users", async (req, res) => {
  try {
    const users = await User.find({});
    return res.status(200).json(users);
  } catch (e) {
    console.log(e);
  }
});

// We create a new user by sending a post with /api/users
apiRouter.post("/users", async (req, res) => {
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
// PATH /api/users/:_id/exercises
// POST: Store new exercise in the Exercise model
apiRouter.post("/users/:_id/exercises", async (req, res) => {
  try {
    // get the user inputs from the DOM(form) using the following
    const { description, duration, date } = req.body;
    const _id = req.body[":_id"] || req.params._id;

    // find user by it _id
    const user = await User.findOne({ _id: _id });

    // check if the user exist
    if (user) {
      const newExercise = {
        userId: _id,
        description: description,
        duration: duration,
        date: date ? new Date(date).toDateString() : new Date().toDateString(), // condition if date exist or not
      };

      // create the user a exercise object in the exercise model
      const CreatedEx = await Exercise.create(newExercise);

      // response with a json of the exercise created
      return res.status(200).json({
        username: user.username,
        description: CreatedEx.description,
        duration: CreatedEx.duration,
        date: CreatedEx.date,
        _id: _id,
      });
    } else {
      return res.status(400).json({ message: "user with id not found" });
    }
  } catch (e) {
    console.log(e);
  }
});

// GET user's exercise log: GET /api/users/:_id/logs?[from][&to]
apiRouter.get("/users/:_id/logs", async (req, res) => {
  try {
    const { from, to, limit } = req.query;
    const _id = req.params._id;
    const foundUser = await User.findById({ _id });

    if (foundUser._id) {
      const { username } = foundUser;
      let userExercises = await Exercise.find({ userId: _id });
      console.log("Exuser", userExercises);

      // get from date and Filter it, if from date is provided
      if (from) {
        let pastDate = new Date(from);
        userExercises = userExercises.filter(
          (exercise) => new Date(exercise.date) >= pastDate,
        );
      }

      // get to date and Filter the exercise base on the date, if to date is provided
      if (to) {
        let presentDate = new Date(to);
        userExercises = userExercises.filter(
          (exercise) => new Date(exercise.date) <= presentDate,
        );
      }

      // if limit provided, show the amount of past exercise to the user

      if (limit) {
        userExercises = userExercises.splice(0, Number(limit));
      }

      // get the length of the exercise created, by user
      const count = userExercises.length;

      // Iterate through data array for description, duration, and date keys
      //  to get the amount of exercises the user created, in a log
      let exerciseList = userExercises.map(
        ({ description, duration, date }) => {
          return {
            description: description,
            duration: duration,
            date: date,
          };
        },
      );
      // Add the exerciseList of objects to the log, to return
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

// Part not rquired by FCC
// Getting the list of all exercise
apiRouter.get("/exercises", async (req, res) => {
  try {
    const exercises = await Exercise.find({});
    return res.status(200).json(exercises);
  } catch (e) {
    console.log(e);
  }
});

module.exports = apiRouter;
