"use strict";
const profileController = require("../controllers/profileController");
const express = require("express");
const router = express.Router();
const passport = require("passport");

//Create Profile /api/profile
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  profileController.createUser
);

//Get current user profile /api/profile
router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  profileController.getCurrentUser
);

module.exports = router;
