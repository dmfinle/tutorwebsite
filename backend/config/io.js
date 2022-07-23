"use strict";

//Creates socket io server
const socket = require("socket.io");

const socketConnect = async (server) => {
  const io = socket(server);
  const users = {};

  const messages = {};
  const socketToRoom = {};

  let userMessages = [];

  const addUser = (userId, socketId) => {
    !userMessages.some((user) => user.userId === userId) &&
      userMessages.push({ userId, socketId });
  };

  const removeUser = (socketId) => {
    userMessages = userMessages.filter((user) => user.socketId !== socketId);
  };

  const getUser = (userId) => {
    return userMessages.find((user) => user.userId === userId);
  };

  const videoChat = io.of("/video-chat");
  const messageChat = io.of("/message-chat");

  //Instant message io
  messageChat.on("connection", (socket) => {
    console.log("a user joined");

    socket.on("addUser", (userId) => {
      addUser(userId, socket.id);
      messageChat.emit("getUsers", userMessages);
    });

    socket.on("sendMessage", ({ senderId, receiverId, text }) => {
      const user = getUser(receiverId);

      messageChat.to(user?.socketId).emit("getMessage", {
        senderId,
        text,
      });
    });

    socket.on("userTyping", ({ senderId, receiverId, typing }) => {
      const user = getUser(receiverId);
      messageChat.to(user?.socketId).emit("receivingTyping", {
        typing,
      });
    });

    socket.on("disconnect", () => {
      console.log("a user disconnected");
      removeUser(socket.id);
      messageChat.emit("getUsers", userMessages);
    });
  });

  //Video streaming and live chat io
  videoChat.on("connection", (socket) => {
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
      let videoBool;
      if (usersInThisRoom.length === 1) {
        videoBool = true;
      } else {
        videoBool = false;
      }
      const usersInThisRoomInfo = {
        usersInThisRoom: usersInThisRoom,
        videoBool: videoBool,
      };
      socket.emit("all users", usersInThisRoomInfo);
      videoChat.emit("new user", users[roomID]);
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
      videoChat.to(payload.userToSignal).emit("user joined", {
        signal: payload.signal,
        callerID: payload.callerID,
        videoBool: true,
      });
    });

    socket.on("returning signal", (payload) => {
      videoChat.to(payload.callerID).emit("receiving returned signal", {
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
      const userInfo = {
        id: socket.id,
        videoBool: false,
      };
      socket.broadcast.emit("user left", userInfo);
      if (users[roomID].length === 0) {
        delete messages[roomID];
      }
      videoChat.emit("new user", users[roomID]);
    });
  });
};

module.exports = socketConnect;
