import styled from "styled-components";
import React, { useState } from "react";
import { Button, Drawer, Input } from "@material-ui/core";
import { getMessageDateOrTime } from "../../utils/helper";
// Import Styles
import "../video2/style/chatDrawer.scss";

// Import Icons
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ChatIcon from "@material-ui/icons/Chat";
import { v1 as uuid } from "uuid";

// const rooms = ["general", "random", "jokes", "javascript"];

const Container = styled.div`
  height: 100vh;
  width: 100%;
  display: flex;
`;

const SideBar = styled.div`
  height: 100%;
  width: 15%;
  border-right: 1px solid black;
`;

const ChatPanel = styled.div`
  height: 100;
  width: 85%;
  display: flex;
  flex-direction: column;
`;

const BodyContainer = styled.div`
  width: 100%;
  height: 75%;
  overflow: scroll;
  border-bottom: 1px solid black;
`;

const TextBox = styled.textarea`
  height: 15%;
  width: 100%;
`;

const ChannelInfo = styled.div`
  height: 10%;
  width: 100%;
  border-bottom: 1px solid black;
`;

const Row = styled.div`
  cursor: pointer;
`;

const Messages = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

function Chat(props) {
  // function renderRooms(room) {
  //   const currentChat = {
  //     chatName: room,
  //     isChannel: true,
  //     recevierId: "",
  //   };
  //   return (
  //     <Row onClick={() => props.toggleChat(currentChat)} key={room}>
  //       {room}
  //     </Row>
  //   );
  // }

  // function renderUser(user) {
  //   if (user.id === props.yourId) {
  //     return <Row key={user.id}>You: {user.username}</Row>;
  //   }
  //   const currentChat = {
  //     chatName: user.username,
  //     isChannel: false,
  //     receiverId: user.id,
  //   };
  //   return (
  //     <Row
  //       onClick={() => {
  //         props.toggleChat(currentChat);
  //       }}
  //       key={user.id}
  //     >
  //       {user.username}
  //     </Row>
  //   );
  // }

  // function renderMessages(message, index) {
  //   return (
  //     <div key={index}>
  //       <h3>{message.sender}</h3>
  //       <p>{message.content}</p>
  //     </div>
  //   );
  // }

  let body;

  // if (
  //   !props.currentChat.isChannel ||
  //   props.connectedRooms.includes(props.currentChat.chatName)
  // ) {
  //   body = <Messages>{props.messages.map(renderMessages)}</Messages>;
  // } else {
  //   body = (
  //     <button onClick={() => props.joinRoom(props.currentChat.chatName)}>
  //       Join {props.currentChat.chatName}
  //     </button>
  //   );
  // }

  function handleKeyPress(e) {
    if (e.key === "Enter") {
      props.sendMessage();
    }
  }
  return (
    <React.Fragment>
      <Drawer
        className="chat-drawer"
        anchor={"right"}
        open={props.chatToggle}
        onClose={props.closeDrawer}
      >
        <div className="chat-head-wrapper">
          <div className="chat-drawer-back-icon" onClick={props.closeDrawer}>
            <ChevronRightIcon></ChevronRightIcon>
          </div>
          <div className="chat-header">
            <ChatIcon></ChatIcon>
            <h3 className="char-header-text">Chat</h3>
          </div>
        </div>
        <div className="chat-drawer-list">
          {props.messages.map((chatDetails) => {
            return (
              <div key={uuid()} className="message-container">
                <div className="message-wrapper">
                  <div key={uuid()} className="message-title-wrapper">
                    <h5 key={uuid()} className="message-name">
                      {chatDetails.sender}
                    </h5>
                    <span key={uuid()} className="message-timestamp">
                      {getMessageDateOrTime(chatDetails.date)}
                    </span>
                  </div>
                  {chatDetails.sender ? (
                    <p key={uuid()} className="actual-message">
                      {chatDetails.content}
                    </p>
                  ) : (
                    <p> </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="chat-drawer-input-wrapper">
          <Input
            className="chat-drawer-input"
            onChange={props.handleMessageChange}
            value={props.message}
            placeholder="Type Here"
            onKeyPress={handleKeyPress}
          />
          <Button onClick={props.sendMessage}>Send</Button>
        </div>
      </Drawer>
    </React.Fragment>
  );
}

export default Chat;
