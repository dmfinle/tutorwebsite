import "./conversation.css";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Conversation({ conversation, currentUser }) {
  const [user, setUser] = useState(null);
  const path =
    "https://cdn2.vectorstock.com/i/1000x1000/20/76/man-avatar-profile-vector-21372076.jpg";

  useEffect(() => {
    const friendId = conversation.members.find((m) => m !== currentUser.id);

    const getUser = async () => {
      try {
        const res = await axios(`/api/users/${friendId}`);
        setUser(res.data);
        //console.log(user);
      } catch (err) {
        console.log(err);
      }
    };
    getUser();
  }, [currentUser, conversation]);
  return (
    <div className="conversation">
      <img
        className="conversationImg"
        src={user?.profilePicture ? user.profilePicture : path}
        alt=""
      ></img>
      <span className="conversationName">{user?.email}</span>
    </div>
  );
}
