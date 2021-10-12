import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";

const Container = styled.div`
  padding: 20px;
  display: flex;
  height: 100vh;
  width: 90%;
  margin: auto;
  flex-wrap: wrap;
`;

const StyledVideo = styled.video`
  height: 70%;
  width: 50%;
`;

const Video = (props) => {
  const ref = useRef();

  useEffect(() => {
    props.peer.on("stream", (stream) => {
      ref.current.srcObject = stream;
    });
  }, [props.peer]);

  return <StyledVideo playsInline autoPlay ref={ref} />;
};

const videoConstraints = {
  height: window.innerHeight / 2,
  width: window.innerWidth / 2,
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
  var track;

  const roomID = props.match.params.roomID;

  useEffect(() => {
    console.log("peer");
    console.log(peersRef);
    if (share) {
      if (peers[0] !== undefined && peers[0].peer.destroyed === false) {
        const track = peers[0].peer.streams[0].getVideoTracks()[0];

        peers[0].peer.replaceTrack(track, tracky, peers[0].peer.streams[0]);
      }
    }
    // else {
    //   if (peers[0] !== undefined && peers[0].peer.destroyed === false) {
    //     peers[0].peer.replaceTrack(
    //       tracky,
    //       userStream.current.getTracks()[1],
    //       peers[0].peer.streams[0]
    //     );
    //   }
    // }
  }, [share, tracky, peers]);

  useEffect(() => {
    socketRef.current = io.connect("/");
    navigator.mediaDevices
      .getUserMedia({ video: videoConstraints, audio: true })
      .then((stream) => {
        userVideo.current.srcObject = stream;
        userStream.current = stream;

        console.log("first stream");
        //console.log(userVideo.current.srcObject);

        socketRef.current.emit("join room", roomID);
        socketRef.current.on("all users", (users) => {
          console.log("all users");
          const peers = [];

          users.forEach((userID) => {
            console.log("user for each");
            const peer = createPeer(userID, socketRef.current.id, stream);
            peersRef.current.push({
              peerID: userID,
              peer,
            });

            peers.push({
              peerID: userID,
              peer,
            });
          });

          setPeers(peers);
        });

        socketRef.current.on("user joined", (payload) => {
          console.log("user joined");

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

        socketRef.current.on("user left", (id) => {
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

  //TODO very buggy. If sharing screen before user enters doesn't work.
  function shareScreen() {
    if (!share) {
      navigator.mediaDevices
        .getDisplayMedia({ cursor: true })
        .then((stream) => {
          track = stream.getTracks()[0];
          userVideo.current.srcObject = stream;

          setTracky(track);
          setShare(true);

          console.log("user start");
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
            console.log(share);
            console.log("-------ended");
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

      setShare(false);

      userVideo.current.srcObject
        .getTracks()[0]
        .dispatchEvent(new Event("ended"));
    }
  }

  return (
    <Container>
      <button onClick={shareScreen}> Share Screen </button>
      <button onClick={micControl}> Toggle Mic </button>
      <button onClick={cameraControl}> Toggle Camera </button>
      <StyledVideo ref={userVideo} autoPlay playsInline />
      {peers.map((peer) => {
        return <Video key={peer.peerID} peer={peer.peer} />;
      })}
    </Container>
  );
};

export default Room;
