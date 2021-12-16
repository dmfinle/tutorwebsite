//chat stuff
import Form from "./UsernameForm";
import Chat from "./Chat";
import io from "socket.io-client";
import immer from "immer";
import { connect } from "react-redux";
import React, { useState, useRef, useEffect } from "react";
import { v1 as uuid } from "uuid";

const initialMessagesState = {
  general: [],
  random: [],
  jokes: [],
  javascript: [],
};
function All(props) {
  const [username, setUsername] = useState("");
  const [connected, setConnected] = useState(false);
  const [currentChat, setCurrentChat] = useState({
    isChannel: true,
    chatName: "general",
    receiverId: "",
  });
  const [connectedRooms, setConnectedRooms] = useState(["general"]);
  const [allUsers, setAllUsers] = useState([]);
  const [messages, setMessages] = useState(initialMessagesState);
  const [message, setMessage] = useState("");
  const socketRef = useRef();

  function handleMessageChange(e) {
    setMessage(e.target.value);
  }

  useEffect(() => {
    setMessage("");
  }, [messages]);

  function sendMessage() {
    const payload = {
      content: message,
      to: currentChat.isChannel ? currentChat.chatName : currentChat.receiverId,
      sender: username,
      chatName: currentChat.chatName,
      isChannel: currentChat.isChannel,
      date: Date(),
    };
    socketRef.current.emit("send message", payload);
    const newMessages = immer(messages, (draft) => {
      draft[currentChat.chatName].push({
        sender: username,
        content: message,
        date: Date(),
      });
    });
    setMessages(newMessages);
  }

  function roomJoinCallback(incomingMessages, room) {
    const newMessages = immer(messages, (draft) => {
      draft[room] = incomingMessages;
    });
    setMessages(newMessages);
  }

  function joinRoom(room) {
    const newConnectedRooms = immer(connectedRooms, (draft) => {
      draft.push(room);
    });
    socketRef.current.emit("join room2", room, (messages) =>
      roomJoinCallback(messages, room)
    );
    setConnectedRooms(newConnectedRooms);
  }

  function toggleChat(currentChat) {
    if (!messages[currentChat.chatName]) {
      const newMessages = immer(messages, (draft) => {
        draft[currentChat.chatName] = [];
      });
      setMessages(newMessages);
    }
    setCurrentChat(currentChat);
  }

  function handleChange(e) {
    setUsername(e.target.value);
  }

  function connect2() {
    setUsername(props.auth.user.firstName);
    setConnected(true);
    socketRef.current = io.connect("/");
    socketRef.current.emit("join room", uuid(), username);
    socketRef.current.emit("join room2", "general", (messages) =>
      roomJoinCallback(messages, "general")
    );
    socketRef.current.on("new user", (allUsers) => {
      setAllUsers(allUsers);
    });
    socketRef.current.on(
      "new message",
      ({ content, sender, chatName, date }) => {
        setMessages((messages) => {
          const newMessages = immer(messages, (draft) => {
            if (draft[chatName]) {
              draft[chatName].push({ content, sender, date });
            } else {
              draft[chatName] = [{ content, sender, date }];
            }
          });
          return newMessages;
        });
      }
    );
  }

  let body;
  if (connected) {
    body = (
      <Chat
        message={message}
        handleMessageChange={handleMessageChange}
        sendMessage={sendMessage}
        yourId={socketRef.current ? socketRef.current.id : ""}
        allUsers={allUsers}
        joinRoom={joinRoom}
        connectedRooms={connectedRooms}
        currentChat={currentChat}
        toggleChat={toggleChat}
        messages={messages[currentChat.chatName]}
        chatToggle={props.chatToggle}
        closeDrawer={() => props.chatHandle(false)}
      />
    );
  } else {
    // body = (
    //   <Form username={username} onChange={handleChange} connect={connect2} />
    // );

    connect2();
  }

  return <div className="App">{body}</div>;
}

const mapStateToProps = (state) => ({
  profile: state.profile,
  auth: state.auth,
});

export default connect(mapStateToProps)(All);