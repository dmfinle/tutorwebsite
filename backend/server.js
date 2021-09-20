"use strict";
const connectDB = require("./config/db");
//dotenv config
const dotenv = require("dotenv");
dotenv.config();

//Load Routes
const userRoutes = require("./routes/userRoute");
const profileRoutes = require("./routes/profileRoute");

//Load authentication and environment variables
const keys = require("./config/keys");
const passport = require("passport");
const session = require("express-session");

//Load Express
const express = require("express");

//connect database
connectDB();

const app = express();

//Express middleware config
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Config express-session
const sessConfig = {
  secret: keys.sessionSecret,
  cookie: {},
  resave: false,
  saveUninitialized: true,
};

app.use(session(sessConfig));

// Passport Config
require("./config/userAuth")(passport);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Define Routes
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);

//route doesn't exist
app.get("*", (req, res, next) => {
  res.status(404);
  res.json("Page not Found");
});
const PORT = process.env.PORT || 5000;

//Express js listen method to run project on localhost:5000
app.listen(
  PORT,
  console.log(`App is running in ${process.env.NODE_ENV}
    mode on port ${PORT}`)
);
