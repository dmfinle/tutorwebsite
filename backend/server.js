"use strict";
const connectDB = require("./config/db");
const socket = require("socket.io");
const { uuid } = require("uuidv4");
const cors = require("cors");

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
const app = express();

//connect database
connectDB();

//Express middleware config
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cors({ origin: "http://localhost:3000" }));
app.use(cors());

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
app.get("/api/join", (req, res) => {
  res.send({ link: uuid() });
});

//route doesn't exist TODO don't think this works
app.get("*", (req, res, next) => {
  res.status(404);
  res.json("Page not Found");
});
const PORT = process.env.PORT || 5000;

//Express js listen method to run project on localhost:5000
var server = app.listen(
  PORT,
  console.log(`App is running in ${process.env.NODE_ENV}
    mode on port ${PORT}`)
);

// Start peerjs server
const { PeerServer } = require("peer");
const peerServer = PeerServer({ port: 9000 });

// //Creates socket io server
const io = socket(server);

// //Fires off event that determines if the room is joined by participants
io.on("connection", (socket) => {
  console.log("socket established");
  socket.on("join-room", (userData) => {
    const { roomID, userID } = userData;
    console.log("room");
    console.log(roomID);
    socket.join(roomID);
    socket.to(roomID).emit("new-user-connect", userData);
    socket.on("disconnect", () => {
      socket.to(roomID).emit("user-disconnected", userID);
    });
    socket.on("broadcast-message", (message) => {
      socket
        .to(roomID)
        .emit("new-broadcast-messsage", { ...message, userData });
    });

    socket.on("display-media", (value) => {
      socket.to(roomID).emit("display-media", { userID, value });
    });
    socket.on("user-video-off", (value) => {
      socket.to(roomID).emit("user-video-off", value);
    });
  });
});
