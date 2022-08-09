import "./room.css";
import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";
import CallIcon from "@material-ui/icons/CallEnd";
import MicIcon from "@material-ui/icons/Mic";
import MicOffIcon from "@material-ui/icons/MicOff";
import FullscreenIcon from "@material-ui/icons/Fullscreen";
import { PictureInPicture } from "@material-ui/icons";
import VideocamIcon from "@material-ui/icons/Videocam";
import VideocamOffIcon from "@material-ui/icons/VideocamOff";
import ChatIcon from "@material-ui/icons/Chat";
import SocketChat from "../video-chat/SocketChat";
import { Button, Grid, IconButton } from "@mui/material";
import CodeEditor from "../compiler/CodeEditor";
import { CloseFullscreenOutlined } from "@mui/icons-material";

const Container = styled.div`
  padding: 20px;
  display: flex;
  height: 100vh;
  width: 90%;
  margin: auto;
  flex-wrap: wrap;
`;
let ref;
const Video = (props) => {
  ref = useRef();
  useEffect(() => {
    props.peer.on("stream", (stream) => {
      ref.current.srcObject = stream;
    });
  }, [props.peer]);

  return <video className={props.className} playsInline autoPlay ref={ref} />;
};

const videoConstraints = {
  height: window.innerHeight,
  width: window.innerWidth,
};

const Room = (props) => {
  const [peers, setPeers] = useState([]);
  const socketRef = useRef();
  const userVideo = useRef();
  const userStream = useRef();
  const peersRef = useRef([]);
  const [mic, setMic] = useState(true);
  const [camera, setCamera] = useState(true);
  const [share, setShare] = useState(false);
  const [tracky, setTracky] = useState({});
  const [videoBool, setVideoBool] = useState(false); //boolean set to true if 2 people in call
  const [chatToggle, setChatToggle] = useState(false);
  const [fullscreen, setFullScreen] = useState(false);
  var track;
  //const [userDetails, setUserDetails] = useState(null);
  //const [messages, setMessages] = useState([]);

  const roomID = props.match.params.roomID;

  useEffect(() => {
    socketRef.current = io.connect("/video-chat");
  }, []);

  useEffect(() => {
    if (share) {
      if (peers[0] !== undefined && peers[0].peer.destroyed === false) {
        const track = peers[0].peer.streams[0].getVideoTracks()[0];

        peers[0].peer.replaceTrack(track, tracky, peers[0].peer.streams[0]);
      }
    }
  }, [share, tracky, peers]);

  useEffect(() => {
    if (fullscreen && document.pictureInPictureElement) {
      document.exitPictureInPicture();
    }
  }, [fullscreen]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (userVideo.current !== undefined) {
          userVideo.current.srcObject = stream;
        }
        userStream.current = stream;

        socketRef.current.emit("join room", roomID);
        socketRef.current.on("all users", (userInfo) => {
          const peers = [];
          let users = userInfo.usersInThisRoom;
          setVideoBool(userInfo.videoBool);
          users.forEach((user) => {
            const peer = createPeer(user.id, socketRef.current.id, stream);
            peersRef.current.push({
              peerID: user.id,
              peer,
            });

            peers.push({
              peerID: user.id,
              peer,
            });
          });

          setPeers(peers);
        });

        socketRef.current.on("user joined", (payload) => {
          console.log("user joined");
          setVideoBool(payload.videoBool);
          const peer = addPeer(payload.signal, payload.callerID, stream);
          peersRef.current.push({
            peerID: payload.callerID,
            peer,
          });

          setPeers([...peersRef.current]);
        });

        socketRef.current.on("receiving returned signal", (payload) => {
          const item = peersRef.current.find((p) => p.peerID === payload.id);
          item.peer.signal(payload.signal);
        });

        socketRef.current.on("user left", (userInfo) => {
          console.log("user left");
          setVideoBool(userInfo.videoBool);
          let id = userInfo.id;
          const peerObj = peersRef.current.find((p) => p.peerID === id);
          if (peerObj) {
            peerObj.peer.destroy();
          }
          const peers = peersRef.current.filter((p) => p.peerID !== id);

          peersRef.current = peers;
          setPeers(peers);
        });
      });

    // return () => {
    //   //socketRef.current.emit("user left");
    // };
  }, [roomID]);

  function createPeer(userToSignal, callerID, stream) {
    console.log("create");
    const peer = new Peer({
      initiator: true,
      trickle: false,
      config: {
        iceServers: [
          {
            urls: "stun:stun.stunprotocol.org",
          },
          {
            urls: "turn:numb.viagenie.ca",
            credential: "muazkh",
            username: "webrtc@live.com",
          },
        ],
      },
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("sending signal", {
        userToSignal,
        callerID,
        signal,
      });
    });

    return peer;
  }

  function addPeer(incomingSignal, callerID, stream) {
    console.log("add peer");
    const peer = new Peer({
      initiator: false,
      trickle: false,
      config: {
        iceServers: [
          {
            urls: "stun:stun.stunprotocol.org",
          },
          {
            urls: "turn:numb.viagenie.ca",
            credential: "muazkh",
            username: "webrtc@live.com",
          },
        ],
      },
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("returning signal", { signal, callerID });
    });

    peer.on("stream", (stream) => {
      //console.log(stream);
    });

    peer.signal(incomingSignal);

    return peer;
  }

  function cameraControl() {
    if (userVideo) {
      userVideo.current.srcObject.getVideoTracks().forEach((track) => {
        //console.log(track);
        if (track.kind === "video") {
          //camera stops sharing but camera indicator light is stil on on mac. Happens in chrome firefox turns indicator off. Chrome issue
          track.enabled = !camera;

          setCamera(!camera);
        }
      });
    }
  }

  function micControl() {
    if (userVideo) {
      userVideo.current.srcObject.getAudioTracks().forEach((track) => {
        //console.log(track);
        if (track.kind === "audio") {
          track.enabled = !mic;

          setMic(!mic);
        }
      });
    }
  }

  function shareScreen() {
    if (!share) {
      navigator.mediaDevices
        .getDisplayMedia({
          cursor: true,
          video: {
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
          },
        })
        .then((stream) => {
          track = stream.getTracks()[0];
          userVideo.current.srcObject = stream;

          setTracky(track);
          setShare(true);

          //console.log(userVideo.current.srcObject.getTracks());

          if (peers[0] !== undefined && peers[0].peer.destroyed === false) {
            peers[0].peer.replaceTrack(
              peers[0].peer.streams[0].getVideoTracks()[0],
              track,
              peers[0].peer.streams[0]
            );
          }

          track.onended = function () {
            setShare(false);

            userVideo.current.srcObject = userStream.current;

            if (
              peersRef.current[0] !== undefined &&
              peersRef.current[0].peer.destroyed === false
            ) {
              peersRef.current[0].peer.replaceTrack(
                track,
                userStream.current.getTracks()[1],
                peersRef.current[0].peer.streams[0]
              );
            }
          };
        });
    } else {
      userVideo.current.srcObject.getTracks()[0].stop();

      userVideo.current.srcObject
        .getTracks()[0]
        .dispatchEvent(new Event("ended"));
      setShare(false);
    }
  }

  //Force disconnect
  function userLeft() {
    //Stop audio and video tracks
    userVideo.current.srcObject.getTracks().forEach((track) => {
      track.stop();
    });
    //Disconnect socket
    console.log(socketRef.current);
    socketRef.current.disconnect();
    //Navigate to rooms
    props.history.push("/room");
  }

  function chatHandle() {
    setChatToggle(!chatToggle);
  }

  const pipHandle = () => {
    // console.log(ref);
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture();
    } else if (!fullscreen && !videoBool && !document.pictureInPictureElement) {
      userVideo?.current?.requestPictureInPicture();
    } else if (!fullscreen && videoBool && !document.pictureInPictureElement) {
      // ref?.current.requestPictureInPicture();
      ref?.current?.requestPictureInPicture();
    }
  };

  return (
    <div>
      <CodeEditor props={props} />
      {!fullscreen ? (
        <IconButton
          size="large"
          className="small-screen"
          sx={{ color: "white" }}
        >
          <FullscreenIcon
            variant="filled"
            fontSize="large"
            onClick={() => setFullScreen(!fullscreen)}
          />
          <PictureInPicture
            variant="filled"
            fontSize="large"
            onClick={pipHandle}
          ></PictureInPicture>
        </IconButton>
      ) : (
        <IconButton
          size="large"
          className="large-screen"
          sx={{ color: "white" }}
        >
          <CloseFullscreenOutlined
            variant="filled"
            fontSize="large"
            onClick={() => setFullScreen(!fullscreen)}
          />

          <PictureInPicture
            variant="filled"
            fontSize="large"
            onClick={pipHandle}
          ></PictureInPicture>
        </IconButton>
      )}
      <div className="video-components">
        {/* <Container> */}
        {/* <Grid container> */}
        {/* <div className="main"> */}
        {/* <div className="user-video"> */}
        <div className="bottom">
          <video
            className={
              videoBool
                ? share
                  ? "peer-video"
                  : "flip peer-video"
                : share
                ? fullscreen
                  ? "user-video full-screen"
                  : "user-video"
                : fullscreen
                ? "flip user-video full-screen"
                : "flip user-video"
            }
            ref={userVideo}
            autoPlay
            playsInline
          />
          {peers.map((peer) => {
            return (
              <Video
                className={
                  videoBool
                    ? fullscreen
                      ? "user-video full-screen"
                      : "user-video"
                    : "peer-video"
                }
                key={peer.peerID}
                peer={peer.peer}
              />
            );
          })}
          <div className="video-buttons">
            <Grid container spacing={1}>
              <IconButton size="medium">
                <Button variant="outlined" onClick={shareScreen}>
                  {!share ? "Share Screen" : "Sharing"}
                </Button>
              </IconButton>
              {mic ? (
                <IconButton size="medium">
                  <MicIcon fontSize="medium" onClick={micControl} />
                </IconButton>
              ) : (
                <IconButton size="medium">
                  <MicOffIcon fontSize="medium" onClick={micControl} />
                </IconButton>
              )}
              {camera ? (
                <IconButton size="medium">
                  <VideocamIcon fontSize="medium" onClick={cameraControl} />
                </IconButton>
              ) : (
                <IconButton size="medium">
                  <VideocamOffIcon fontSize="medium" onClick={cameraControl} />
                </IconButton>
              )}
              <IconButton size="medium">
                <CallIcon fontSize="inherit" onClick={userLeft} />
              </IconButton>
              <IconButton size="medium">
                <ChatIcon fontSize="inherit" onClick={chatHandle}></ChatIcon>
              </IconButton>
            </Grid>
          </div>
          {/* <Button className="test" onClick={() => setVideoBool(!videoBool)}>
            Press Me
          </Button> */}
        </div>
        {/* <div> */}
        {/* <StyledVideo ref={userVideo} autoPlay playsInline /> */}
        {/* </div> */}
        {socketRef.current !== undefined && roomID !== undefined ? (
          <SocketChat
            chatToggle={chatToggle}
            chatHandle={chatHandle}
            socketRef={socketRef}
            roomID={roomID}
          />
        ) : (
          <p></p>
        )}
        {/* </Container> */}
      </div>
    </div>
  );
};

export default Room;
