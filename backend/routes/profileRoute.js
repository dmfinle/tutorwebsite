"use strict";
const profileController = require("../controllers/profileController");
const express = require("express");
const router = express.Router();
const passport = require("passport");

//Get current user /api/users/current
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  profileController.getCurrentUser
);

//Get current user /api/users/current
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  profileController.createUser
);

module.exports = router;
