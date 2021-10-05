import openSocket from "socket.io-client";
import Peer from "peerjs";
import { toast } from "react-toastify";
// @ts-ignore

const websocket = "/";
const peerjsEndpoint = "localhost"; //TODO probably change
let socketInstance = null;
let peers = {};

class SocketConnection {
  videoContainer = {};
  message = [];
  settings;
  streaming = false;
  myPeer;
  socket;
  isSocketConnected = false;
  isPeersConnected = false;
  myID = "";

  constructor(settings) {
    this.settings = settings;
    this.myPeer = initializePeerConnection();
    this.socket = initializeSocketConnection();
    if (this.socket) this.isSocketConnected = true;
    if (this.myPeer) this.isPeersConnected = true;
    this.initializeSocketEvents();
    this.initializePeersEvents();
  }

  initializeSocketEvents = () => {
    this.socket.on("connect", () => {
      console.log("socket connected");
    });
    this.socket.on("user-disconnected", (userID) => {
      console.log("user disconnected-- closing peers", userID);
      peers[userID] && peers[userID].close();
      this.removeVideo(userID);
    });
    this.socket.on("disconnect", () => {
      console.log("socket disconnected --");
    });
    this.socket.on("error", (err) => {
      console.log("socket error --", err);
    });
    this.socket.on("new-broadcast-messsage", (data) => {
      this.message.push(data);
      this.settings.updateInstance("message", this.message);
      toast.info(`${data.message.message} By ${data.userData.name}`);
    });
    this.socket.on("display-media", (data) => {
      if (data.value)
        checkAndAddClass(this.getMyVideo(data.userID), "displayMedia");
      else checkAndAddClass(this.getMyVideo(data.userID), "userMedia");
    });
    // this.socket.on('user-video-off', (data:UserVideoToggle) => {
    //     changeMediaView(data.id, data.status);
    // });
  };

  initializePeersEvents = () => {
    this.myPeer.on("open", (id) => {
      const { userDetails } = this.settings;
      this.myID = id;
      const roomID = window.location.pathname.split("/")[2];
      const userData = {
        userID: id,
        roomID,
        ...userDetails,
      };
      console.log("peers established and joined room", userData);
      this.socket.emit("join-room", userData);
      this.setNavigatorToStream();
    });
    this.myPeer.on("error", (err) => {
      console.log("peer connection error", err);
      this.myPeer.reconnect();
    });
  };

  setNavigatorToStream = () => {
    this.getVideoAudioStream().then((stream) => {
      if (stream) {
        this.streaming = true;
        this.settings.updateInstance("streaming", true);
        console.log("called again");
        console.log("h");
        this.createVideo({ id: this.myID, stream });
        this.setPeersListeners(stream);
        this.newUserConnection(stream);
      }
    });
  };

  getVideoAudioStream = (video = true, audio = true) => {
    let quality = this.settings.params.quality;
    if (quality) quality = parseInt(quality);
    // @ts-ignore
    const myNavigator =
      navigator.mediaDevices.getUserMedia ||
      navigator.mediaDevices.webkitGetUserMedia ||
      navigator.mediaDevices.mozGetUserMedia ||
      navigator.mediaDevices.msGetUserMedia;
    return myNavigator({
      video: video
        ? {
            frameRate: quality ? quality : 12,
            noiseSuppression: true,
            width: { min: 640, ideal: 1280, max: 1920 },
            height: { min: 480, ideal: 720, max: 1080 },
          }
        : false,
      audio: audio,
    });
  };

  setPeersListeners = (stream) => {
    this.myPeer.on("call", (call) => {
      call.answer(stream);
      call.on("stream", (userVideoStream) => {
        this.createVideo({ id: call.metadata.id, stream: userVideoStream });
      });
      call.on("close", () => {
        console.log("closing peers listeners", call.metadata.id);
        this.removeVideo(call.metadata.id);
      });
      call.on("error", () => {
        console.log("peer error ------");
        this.removeVideo(call.metadata.id);
      });
      peers[call.metadata.id] = call;
    });
  };

  newUserConnection = (stream) => {
    this.socket.on("new-user-connect", (userData) => {
      console.log("New User Connected", userData);
      this.connectToNewUser(userData, stream);
    });
  };

  connectToNewUser = (userData, stream) => {
    const { userID } = userData;
    console.log("connect");
    const call = this.myPeer.call(userID, stream, {
      metadata: { id: this.myID },
    });
    call.on("stream", (userVideoStream) => {
      console.log("create video");
      this.createVideo({ id: userID, stream: userVideoStream, userData });
    });
    call.on("close", () => {
      console.log("closing new user", userID);
      this.removeVideo(userID);
    });
    call.on("error", () => {
      console.log("peer error ------");
      this.removeVideo(userID);
    });
    peers[userID] = call;
  };

  broadcastMessage = (message) => {
    this.message.push(message);
    this.settings.updateInstance("message", this.message);
    this.socket.emit("broadcast-message", message);
  };

  createVideo = (createObj) => {
    //const size = Object.keys(this.videoContainer).length;

    if (!this.videoContainer[createObj.id]) {
      this.videoContainer[createObj.id] = {
        ...createObj,
      };
      const roomContainer = document.getElementById("room-container");
      const videoContainer = document.createElement("div");
      const video = document.createElement("video");
      video.srcObject = this.videoContainer[createObj.id].stream;
      video.id = createObj.id;
      video.autoplay = true;
      if (this.myID === createObj.id) video.muted = true;

      videoContainer.appendChild(video);
      roomContainer.append(videoContainer);
    } else {
      // @ts-ignore
      document.getElementById(createObj.id).srcObject = createObj.stream;
    }
  };

  reInitializeStream = (video, audio, type = "userMedia") => {
    // @ts-ignore
    const media =
      type === "userMedia"
        ? this.getVideoAudioStream(video, audio)
        : navigator.mediaDevices.getDisplayMedia();

    return new Promise((resolve) => {
      media.then((stream) => {
        // @ts-ignore
        const myVideo = this.getMyVideo();

        if (type === "displayMedia") {
          //console.log("display");
          this.toggleVideoTrack({ audio, video });
          this.listenToEndStream(stream, { video, audio });
          this.socket.emit("display-media", true);
        }

        checkAndAddClass(myVideo, type);
        this.createVideo({ id: this.myID, stream });
        replaceStream(stream);
        resolve(true);
      });
    });
  };

  removeVideo = (id) => {
    delete this.videoContainer[id];
    const video = document.getElementById(id);
    if (video) video.remove();
  };

  destroyConnection = () => {
    const myMediaTracks = this.videoContainer[this.myID].stream.getTracks();
    myMediaTracks.forEach((track) => {
      track.stop();
    });
    socketInstance.socket.disconnect();
    this.myPeer.destroy();
  };

  getMyVideo = (id = this.myID) => {
    return document.getElementById(id);
  };

  listenToEndStream = (stream, status) => {
    const videoTrack = stream.getVideoTracks();
    if (videoTrack[0]) {
      videoTrack[0].onended = () => {
        this.socket.emit("display-media", false);
        this.reInitializeStream(status.video, status.audio, "userMedia");
        this.settings.updateInstance("displayStream", false);
        this.toggleVideoTrack(status);
      };
    }
  };

  toggleVideoTrack = (status) => {
    const myVideo = this.getMyVideo();
    // @ts-ignore

    if (myVideo && !status.video)
      myVideo.srcObject.getVideoTracks().forEach((track) => {
        if (track.kind === "video") {
          //console.log("hello");
          // track.enabled = status.video;
          // this.socket.emit('user-video-off', {id: this.myID, status: true});
          // changeMediaView(this.myID, true);
          !status.video && track.stop();
        }
      });
    else if (myVideo) {
      //console.log("hello2");
      // this.socket.emit('user-video-off', {id: this.myID, status: false});
      // changeMediaView(this.myID, false);

      this.reInitializeStream(status.video, status.audio);
    }
  };

  toggleAudioTrack = (status) => {
    const myVideo = this.getMyVideo();
    // @ts-ignore
    if (myVideo)
      myVideo.srcObject.getAudioTracks().forEach((track) => {
        if (track.kind === "audio") track.enabled = status.audio;
        status.audio
          ? this.reInitializeStream(status.video, status.audio)
          : track.stop();
      });
  };
}

const initializePeerConnection = () => {
  //TODO add STUN and TURN server to faciliate connections across networks
  return new Peer("", {
    host: peerjsEndpoint,
    secure: false, //TODO change to true once https
    port: 9000,
    config: {
      //TODO change this to coturn turn server. Probably won't need a stun server
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
  });
};

const initializeSocketConnection = () => {
  return openSocket.connect(websocket, {
    secure: true,
    reconnection: true,
    rejectUnauthorized: false,
    reconnectionAttempts: 10,
  });
};

const replaceStream = (mediaStream) => {
  Object.values(peers).forEach((peer) => {
    peer.peerConnection.getSenders().forEach((sender) => {
      if (sender.track.kind === "audio") {
        if (mediaStream.getAudioTracks().length > 0) {
          sender.replaceTrack(mediaStream.getAudioTracks()[0]);
        }
      }
      if (sender.track.kind === "video") {
        if (mediaStream.getVideoTracks().length > 0) {
          sender.replaceTrack(mediaStream.getVideoTracks()[0]);
        }
      }
    });
  });
};

const checkAndAddClass = (video, type = "userMedia") => {
  if (video.classList.length === 0 && type === "displayMedia")
    video.classList.add("display-media");
  else video.classList.remove("display-media");
};

// const changeMediaView = (userID, status) => {
//   const userVideoDOM = document.getElementById(userID);
//   if (status) {
//     const clientPosition = userVideoDOM.getBoundingClientRect();
//     const createdCanvas = document.createElement("SPAN");
//     createdCanvas.className = userID;
//     createdCanvas.style.position = "absolute";
//     createdCanvas.style.left = `${clientPosition.left}px`;
//     createdCanvas.style.top = `${clientPosition.top}px`;
//     // createdCanvas.style.width = `${userVideoDOM.videoWidth}px`;
//     // createdCanvas.style.height = `${clientPosition.height}px`;
//     createdCanvas.style.width = "100%";
//     createdCanvas.style.height = "100%";
//     createdCanvas.style.backgroundColor = "green";
//     userVideoDOM.parentElement.appendChild(createdCanvas);
//   } else {
//     const canvasElement = document.getElementsByClassName(userID);
//     if (canvasElement[0]) canvasElement[0].remove();
//   }
// };
export function createSocketConnectionInstance(settings = {}) {
  return (socketInstance = new SocketConnection(settings));
}
