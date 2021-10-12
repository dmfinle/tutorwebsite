"use strict";
const connectDB = require("./config/db");
const socket = require("socket.io");
//const cors = require("cors");

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

// //Creates socket io server
const io = socket(server);
const users = {};

const socketToRoom = {};

io.on("connection", (socket) => {
  socket.on("join room", (roomID) => {
    if (users[roomID]) {
      const length = users[roomID].length;
      if (length === 2) {
        socket.emit("room full");
        console.log("room full");
        return;
      }
      users[roomID].push(socket.id);
    } else {
      users[roomID] = [socket.id];
    }
    socketToRoom[socket.id] = roomID;
    const usersInThisRoom = users[roomID].filter((id) => id !== socket.id);

    socket.emit("all users", usersInThisRoom);
  });

  socket.on("sending signal", (payload) => {
    io.to(payload.userToSignal).emit("user joined", {
      signal: payload.signal,
      callerID: payload.callerID,
    });
  });

  socket.on("returning signal", (payload) => {
    io.to(payload.callerID).emit("receiving returned signal", {
      signal: payload.signal,
      id: socket.id,
    });
  });

  socket.on("disconnect", () => {
    const roomID = socketToRoom[socket.id];
    let room = users[roomID];
    if (room) {
      room = room.filter((id) => id !== socket.id);
      users[roomID] = room;
    }
    socket.broadcast.emit("user left", socket.id);
  });
});
