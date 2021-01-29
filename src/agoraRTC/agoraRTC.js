import AgoraRTC from "agora-rtc-sdk";
export const AgoraRtcClient = {
  init,
  RTCEvents,
  publishLocalStream,
  leaveClient,
};

// rtc object
let rtc = {
  client: null,
  joined: false,
  published: false,
  localStream: null,
  remoteStreams: [],
  params: {},
};

// Options for joining a channel      // appID: "6fbc3e686d77460a862b797d66bd9737",
let option = {
  //appID: "5ad55b79654f472584b0382dc126adf5",
  appID: null,
  channel: null,
  uid: null,
  tokenId: null,
};

function init(appID, channelName, tokenId, uid, callback) {
  option.appID = appID;
  option.channel = channelName;
  option.tokenId = tokenId;
  option.uid = uid;
  createClient();
  initClient();
  joinClient(callback);
}

function createClient() {
  rtc.client = AgoraRTC.createClient({
    mode: "live",
    codec: "h264",
  });
}

function initClient() {
  rtc.client.init(option.appID, () => {
    window.console.log("Client Initialized");
  });
}

function joinClient(callback) {
  window.console.log(option);
  //rtc.client.join(option.token, option.channel, option.uid, (uid) => {
  rtc.client.join(option.tokenId, option.channel, option.uid, (uid) => {
    window.console.log("agora join success --> ", uid);
    callback(uid);

    rtc.localStream = AgoraRTC.createStream({
      streamID: uid,
      audio: false,
      video: false,
      screen: false,
    });
    publishLocalStream(uid);
  });
}

function publishLocalStream(uid) {
  rtc.localStream.init(function() {
    // isLocalStreamSuccess = 1;
    window.console.log("PLAY************************************ Localstream");
    rtc.localStream.play("my" + uid);
    rtc.client.publish(rtc.localStream, handleFailed);
  }, handleFailed);
}

function handleFailed(evt) {
  window.console.log(evt);
}

function RTCEvents(callback) {
  rtc.client.on("stream-added", function(evt) {
    rtc.client.subscribe(evt.stream, handleFailed);
  });

  rtc.client.on("stream-subscribed", function(evt) {
    window.console.log("agora stream receaved=====>>>>++");
    let stream = evt.stream;

    setTimeout(() => {
      window.console.log(stream);
      //   stream.play("" + stream.getId());
      // const video = document.getElementById("video"+stream.getId());
      // video.removeAttribute("controls");
      const audio = document.getElementById("audio" + stream.getId());
      //   audio.play();
      window.console.log("ID: ", stream.getId());
      window.console.log("audio Element: ", audio);
    }, 6000);

    callback("SUBSCRIBE_CLIENT", stream);
  });
  rtc.client.on("stream-removed", function() {
    window.console.log("Remove Player");
  });

  rtc.client.on("peer-leave", function(evt) {
    window.console.log("Failed to resume stream.", evt);
    callback("LEAVE_CLIENT", evt.uid);
  });
}

function leaveClient() {
  rtc.client.leave(
    function() {
      window.console.log("client leaves channel");
      rtc.localStream.stop();
      // Close the local stream
      rtc.localStream.close();
      //……
    },
    function(err) {
      window.console.log("client leave failed ", err);
      //error handling
    }
  );
}

// function addPlayer(streamId) {
//     window.console.log("******************AddPlayer********************",streamId);
//     let streamDiv = document.createElement("div");
//     streamDiv.id = streamId;
//     streamDiv.style.transform = "rotateY(180deg)";
//     let stId = ""+streamId;
//     let streamVideo = document.getElementById(stId);
//     window.console.log("******************  Get Document ***********",streamVideo);
//     if(streamVideo !== null) {
//         streamVideo.appendChild(streamDiv);
//     }
// }
