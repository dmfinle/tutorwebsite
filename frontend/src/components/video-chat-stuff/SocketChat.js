//chat stuff
import Form from "./UsernameForm";
import Chat from "./Chat";
import io from "socket.io-client";
import immer from "immer";
import { useSelector } from "react-redux";
import React, { useState, useRef, useEffect } from "react";

function SocketChat(props) {
  const [username, setUsername] = useState("");
  const [connected, setConnected] = useState(false);
  const [currentChat, setCurrentChat] = useState({
    isChannel: true,
    chatName: props.roomID,
    receiverId: "",
  });

  const [allUsers, setAllUsers] = useState([]);
  const [messages, setMessages] = useState({});
  const [message, setMessage] = useState("");
  const auth = useSelector((state) => state.auth);

  function handleMessageChange(e) {
    setMessage(e.target.value);
  }

  useEffect(() => {
    setMessage("");
  }, [messages]);

  function sendMessage() {
    console.log(props.socketRef.current);
    const payload = {
      content: message,
      to: currentChat.isChannel ? currentChat.chatName : currentChat.receiverId,
      sender: username,
      chatName: currentChat.chatName,
      isChannel: currentChat.isChannel,
      date: Date(),
    };
    props.socketRef.current.emit("send message", payload);
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

  // function joinRoom(room) {
  //   const newConnectedRooms = immer(connectedRooms, (draft) => {
  //     draft.push(room);
  //   });
  //   props.socketRef.current.emit("join room2", room, (messages) =>
  //     roomJoinCallback(messages, room)
  //   );
  //   setConnectedRooms(newConnectedRooms);
  // }

  // function toggleChat(currentChat) {
  //   if (!messages[currentChat.chatName]) {
  //     const newMessages = immer(messages, (draft) => {
  //       draft[currentChat.chatName] = [];
  //     });
  //     setMessages(newMessages);
  //   }
  //   setCurrentChat(currentChat);
  // }

  function connect2() {
    setUsername(auth.user.email);
    setConnected(true);
    // socketRef.current = io.connect("/");
    console.log(messages[currentChat.chatName]);
    props.socketRef.current.emit("join room2", props.roomID, (messages) =>
      roomJoinCallback(messages, props.roomID)
    );
    props.socketRef.current.on("new user", (allUsers) => {
      setAllUsers(allUsers);
    });
    props.socketRef.current.on(
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
        messages={messages[currentChat.chatName]}
        chatToggle={props.chatToggle}
        closeDrawer={() => props.chatHandle(false)}
      />
    );
  } else {
    messages[currentChat.chatName] = [];
    connect2();
  }

  return <div className="App">{body}</div>;
}

export default SocketChat;
