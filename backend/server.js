"use strict";
const connectDB = require("./config/db");

//const cors = require("cors");

//dotenv config
const dotenv = require("dotenv");
dotenv.config();

//Load Routes
const userRoutes = require("./routes/userRoute");
const profileRoutes = require("./routes/profileRoute");
const conversationRoutes = require("./routes/conversationsRoute");
const messageRoutes = require("./routes/messagesRoute");
const jobRoutes = require("./routes/jobsRoute");

//Load authentication and environment variables
const keys = require("./config/keys");
const passport = require("passport");
const session = require("express-session");
const socketConnect = require("./config/io");

//Load Express
const express = require("express");
const { isValidObjectId } = require("mongoose");
const app = express();

//connect database
connectDB();

//Express middleware config
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cors({ origin: "http://localhost:3000" }));
//app.use(cors());

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
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/jobs", jobRoutes);
// app.get("/api/join", (req, res) => {
//   res.send({ link: uuid() });
// });

//route doesn't exist TODO don't think this works
app.get("*", (req, res, next) => {
  res.status(404);
  res.json("Page not Found");
});
const PORT = process.env.PORT || 5000;

//Express js listen method to run project on localhost:5000
const server = app.listen(
  PORT,
  console.log(`App is running in ${process.env.NODE_ENV}
    mode on port ${PORT}`)
);

socketConnect(server);
