import AgoraRTC from 'agora-rtc-sdk'
// export const WebRtcClient = {
//     init,
//     RTCEvents,
//     publishLocalStream,
//     leaveClient,
// };
export const AgoraRtcClient = {
    init,
    RTCEvents,
    publishLocalStream,
    leaveClient,
    createClient,
    initClient,
    joinClient
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
    //appID: "cc5a07b265794258a5dce53225a85f83",
    appID: "5ad55b79654f472584b0382dc126adf5",
    channel: "Test",
    uid: null,
    token: "Your token",
};

function init(channelName, callback){
    option.channel = channelName;
    createClient();
    initClient();
    joinClient(callback);
}

function createClient(){
    rtc.client = AgoraRTC.createClient({
        mode: 'live',
        codec: 'h264',
    });
}

function initClient(callback){
    console.log("init clientttttttttttttttt==")
    rtc.client.init(option.appID, () => {
        console.log('Client Initialized');
    });
    rtc.client.on('stream-added', function (evt) {
        console.log(evt);

        let stream = evt.stream;
        if(stream.getId()==='undefined'){
            return;
        }
        callback(stream.getId());
        console.log('stream added event===>>'+stream.getId())
        rtc.client.subscribe(evt.stream, handleFailed);
       
    })
    
    rtc.client.on('stream-subscribed', function (evt) {
        let stream = evt.stream;
        //callback("SUBSCRIBE_CLIENT",stream.getId());
        if(stream.getId()==='undefined'){
            return;
        }
        callback(stream.getId());
        console.log("stream.getId()===>>>"+stream.getId())
        setTimeout(()=>{
            
            stream.play('' + stream.getId());
            // const video = document.getElementById("video"+stream.getId());
            // video.removeAttribute("controls");
        },2000)
        rtc.client.subscribe(evt.stream, handleFailed);
    })
    
    rtc.client.on('stream-removed', function () {
        console.log('Remove Player');
    })
    
    rtc.client.on("peer-leave", function(evt){
        console.error("Failed to resume stream.", evt);
        //callback("LEAVE_CLIENT",evt.uid);
    });
}

//function joinClient(callback){
function joinClient(){
    rtc.client.join(null, option.channel, null, (uid) => {
        console.log("Hitting UID===>>>"+uid);
        //callback(uid);
        // rtc.localStream = AgoraRTC.createStream({
        //     streamID: uid,
        //     audio: true,
        //     video: true,
        //     screen: false,
        // });
        // publishLocalStream(uid);
    });
}

function publishLocalStream(uid){
    rtc.localStream.init(function () {
        // isLocalStreamSuccess = 1;
        console.log("PLAY************************************ Localstream");
        rtc.localStream.play('my'+uid);
        rtc.client.publish(rtc.localStream, handleFailed);
    }, handleFailed);
}

function handleFailed(evt){
 console.log(evt);
}

function RTCEvents(callback){
    rtc.client.on('stream-added', function (evt) {
        rtc.client.subscribe(evt.stream, handleFailed);
    })
    
    rtc.client.on('stream-subscribed', function (evt) {
        let stream = evt.stream;
        callback("SUBSCRIBE_CLIENT",stream.getId());
        setTimeout(()=>{
            stream.play('' + stream.getId());
            // const video = document.getElementById("video"+stream.getId());
            // video.removeAttribute("controls");
        },2000)
    })
    rtc.client.on('stream-removed', function () {
        console.log('Remove Player');
    })
    
    rtc.client.on("peer-leave", function(evt){
        console.error("Failed to resume stream.", evt);
        callback("LEAVE_CLIENT",evt.uid);
    });
}

function leaveClient(){
    rtc.client.leave(function() {
        console.log("client leaves channel");
        rtc.localStream.stop();
        // Close the local stream
        rtc.localStream.close();
        //……
    }, function(err) {
        console.log("client leave failed ", err);
        //error handling
    });
}


// function addPlayer(streamId) {
//     console.log("******************AddPlayer********************",streamId);
//     let streamDiv = document.createElement("div");
//     streamDiv.id = streamId;
//     streamDiv.style.transform = "rotateY(180deg)";
//     let stId = ""+streamId;
//     let streamVideo = document.getElementById(stId);
//     console.log("******************  Get Document ***********",streamVideo);
//     if(streamVideo !== null) {
//         streamVideo.appendChild(streamDiv);
//     }
// }