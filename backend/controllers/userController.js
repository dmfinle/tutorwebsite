"use strict";
const User = require("../models/usersModel.js");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const keys = require("../config/keys");
const jwt = require("jsonwebtoken");
const setting = require("../config/checkProd");

// Load email confirmation functions
const sendEmail = require("../email/email.send");
const msgs = require("../email/email.msgs");
const templates = require("../email/email.templates");

// Load Validation
const validateRegisterInput = require("../validation/registerAuth");
const validateLoginInput = require("../validation/loginAuth");

//getUsers function to get all users
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

//getUserById function to retrieve user by id
exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  //if user id match param id send user else error
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: "user not found" });
    res.status(404);
    throw new Error("user not found");
  }
});

//POST function to register User +++
// @access public
exports.registerUser = asyncHandler(async (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  // Check validation
  if (!isValid) return res.status(400).json(errors);

  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      errors.email = "Email already exists";
      return res.status(400).json(errors);
    }

    // New user
    else {
      const newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
      });

      if (!setting.isProduction) {
        newUser.confirmed = true;
      }

      //console.log(newUser);
      // Generate hashed password
      bcrypt.genSalt(parseInt(keys.saltRounds), (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then((user) => res.json(user))
            .catch((err) => console.error(err));
        });
      });

      if (setting.isProduction) {
        sendEmail(newUser.email, templates.confirm(newUser._id));
      }
    }
  } catch (err) {
    console.error(err);
  }
});

//POST function to login user on validation
// @access public
exports.loginUser = asyncHandler(async (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  // Check Validation
  if (!isValid) return res.status(400).json(errors);

  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      //errors.email = "User not found";
      errors.password = "Incorrect password/email";
      return res.status(404).json(errors);
    }

    //TODO Move in bycrypt function so that only when email and password are correct user can get rejected
    //that they didn't confirm. Prevent security flaws figuring out emails in database
    if (!user.confirmed) {
      errors.email = "User has not confirmed email address";
      return res.status(404).json(errors);
    }

    // Check password
    bcrypt
      .compare(password, user.password)
      .then((isMatch) => {
        if (isMatch) {
          // User Matched
          const payload = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            isAdmin: user.isAdmin,
            email: user.email,
            confirmed: user.confirmed,
            hasProfile: user.hasProfile,
          }; // Create JWT Payload

          // Sign token
          jwt.sign(
            payload,
            keys.secretOrKey,
            //3600 seconds or 60 minutes
            { expiresIn: 3600 },
            (err, token) => {
              if (err) console.error(err);
              res.json({
                success: true,
                token: `Bearer ${token}`,
              });
            }
          );
        } else {
          errors.password = "Incorrect password/email";
          return res.status(404).json(errors);
        }
      })
      .catch((err) =>
        console.error(`Password not authenticated by bcrypt login: ${err}`)
      );
  } catch (err) {
    console.error(err);
  }
});

//GET current user and return
// @access Private
exports.currentUser = asyncHandler(async (req, res) => {
  res.json({
    id: req.user.id,
    fullName: req.user.fullName,
    email: req.user.email,
    isAdmin: req.user.isAdmin,
  });
});
