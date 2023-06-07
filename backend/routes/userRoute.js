"use strict";
const userController = require("../controllers/userController");
const express = require("express");
const router = express.Router();
const passport = require("passport");

//express router method to create route for getting all users
router.get("/", userController.getUsers);

//get users by id (NOTE: Keep routes with ids below other routes)

//Post to Register a user /api/users/register
router.post("/register", userController.registerUser);

//Post to Login a user /api/users/login
router.post("/login", userController.loginUser);

//Get current user /api/users/current
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  userController.currentUser
);

router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  userController.getUserById
);

// //Default catch route
// router.get("*", (req, res, next) => {
//   res.status(404);
//   res.json("Page not Found");
// });

module.exports = router;
