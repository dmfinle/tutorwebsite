"use strict";
const express = require("express");
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const Profile = require("../models/profileModel");
const User = require("../models/usersModel");

//Load validation
const validateProfileInput = require("../validation/profileValidation");

// @route   GET api/profile
// @desc    Get current user's profile
// @access  Private

exports.getCurrentUser = asyncHandler(async (req, res) => {
  const errors = {};
  console.log(req.params);
  try {
    const profile = await Profile.findOne({
      user: req.params.id,
    }).populate("user", ["firstName", "lastName", "email", "isAdmin"]);
    if (!profile) {
      errors.noprofile = "There is no profile for this user";
      return res.status(404).json(errors);
    }
    res.json(profile);
    console.log(profile);
  } catch (err) {
    res.status(404).json(err);
  }
});

// @route   POST api/profile
// @desc    Create or edit user profile
// @access  Private
exports.createUser = (req, res) => {
  const { errors, isValid } = validateProfileInput(req.body);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  // Get fields
  const profileFields = {};
  profileFields.user = req.user.id;

  //if (req.body.handle) profileFields.handle = req.body.handle;
  //if (req.body.major) profileFields.major = req.body.major;
  //if (req.body.minor) profileFields.minor = req.body.minor;
  if (req.body.type) profileFields.type = req.body.type;
  if (req.body.courses) profileFields.courses = req.body.courses;
  profileFields.bio = req.body.bio ? req.body.bio : "";
  profileFields.availability = req.body.availability
    ? req.body.availability
    : "";

  Profile.findOne({ user: req.user.id }).then((profile) => {
    if (profile) {
      // Update profile
      Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      ).then((profile) => res.json(profile));
    }
    // Profile not found
    else {
      new Profile(profileFields).save().then((profile) => console.log(profile));

      // set has profile field to true
      User.findOne({ _id: req.user.id }).then((user) => {
        if (user) {
          User.findOneAndUpdate(
            { _id: req.user.id },
            { $set: { hasProfile: true } }
          ).then((user) => res.sendStatus(200));
        }
      });
    }
  });
};
