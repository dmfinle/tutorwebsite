"use strict";

//Creates socket io server
const socket = require("socket.io");

const socketConnect = async (server) => {
  const io = socket(server);
  const users = {};

  const messages = {};
  const socketToRoom = {};

  io.on("connection", (socket) => {
    socket.on("join room", (roomID) => {
      const user = {
        id: socket.id,
      };
      if (users[roomID]) {
        const length = users[roomID].length;
        if (length === 2) {
          socket.emit("room full");
          console.log("room full");
          return;
        }
        users[roomID].push(user);
      } else {
        users[roomID] = [user];
      }
      socketToRoom[socket.id] = roomID;
      const usersInThisRoom = users[roomID].filter(
        (user) => user.id !== socket.id
      );

      socket.emit("all users", usersInThisRoom);
      io.emit("new user", users[roomID]);
    });

    socket.on("join chat room", (roomName, cb) => {
      socket.join(roomName);
      if (messages[roomName] === undefined) messages[roomName] = [];
      cb(messages[roomName]);
    });

    socket.on(
      "send message",
      ({ content, to, sender, chatName, isChannel, date }) => {
        if (isChannel) {
          const payload = {
            content,
            chatName,
            sender,
            date,
          };
          socket.to(to).emit("new message", payload);
        } else {
          const payload = {
            content,
            chatName: sender,
            sender,
            date,
          };
          socket.to(to).emit("new message", payload);
        }
        if (messages[chatName]) {
          messages[chatName].push({
            sender,
            content,
            date,
          });
        }
      }
    );

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
        room = room.filter((user) => user.id !== socket.id);
        users[roomID] = room;
      }
      socket.broadcast.emit("user left", socket.id);
      if (users[roomID].length === 0) {
        delete messages[roomID];
      }
      io.emit("new user", users[roomID]);
    });
  });
};

module.exports = socketConnect;
