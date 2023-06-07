import Chat from "./Chat";
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

  function chatConnect() {
    setUsername(auth.user.email);
    setConnected(true);

    props.socketRef.current.emit("join chat room", props.roomID, (messages) =>
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
    chatConnect();
  }

  return <div className="App">{body}</div>;
}

export default SocketChat;
