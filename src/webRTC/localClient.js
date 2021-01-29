import {
  AgoraRtcClient
} from "../agoraRTC/agoraRTC";
import {
  setTimeout
} from "core-js";
export const WebRtcClient = {
  connectToRemotePeer,
  initWebRtc,
  changeGainLeft,
  changeGainRight,
  muteAudio,
  resumeAudio,
  setChannelSources,
  saveMasterPreviewID,
  monitorLevelValue,
  getMasterHeadphoneState,
  changePan,
  getSuccessIds,
  disconnectRemotePeer,
  callbackSelfId,
  callInitAgora,
  setGroupData,
  getSelectedChannelPair,
};
let myClient = null;
let createVideoTimer = null;
let mediaStreamSource = {};
let audioContext = {};
var meter = {};
let rafID = {};
let pannerLeft = {};
let pannerRight = {};
let percentageLeft = {};
let percentageRight = {};
let splitter = {};
let gainNodeLeft = {};
let gainNodeRight = {};
let inputNode = {};
let merger1 = {};
let merger2 = {};
let gainLeftBeforeMute = {};
let gainRightBeforeMute = {};
let masterPreviewID = null;
let leftChannelSource = {};
let rightChannelSource = {};
let monitorLevelFaderValue = 0;
let successIds = [];
let reconnect = [];
let rtilPreviewId = [];
let rtilCallbackVolumeMeter = {};
let rtilCallbackVolumeMeterForGroup1 = {};
let rtilCallbackVolumeMeterForGroup2 = {};
let rtilKey = {};
let mapRtilStream = new Map();
let arrayRtilStream = [];
let group1Data = null;
let group2Data = null;
let rtilStreamPriority = {};
let audioSource = new Map();
// let callBackForAudioMeter = new Map();
let selectedChannelPair = {};

function getSuccessIds() {
  return successIds;
}

function monitorLevelValue(value) {
  monitorLevelFaderValue = value;
}

function setChannelSources(previewId, channelID, item) {
  if (channelID == 0 || channelID == 2 || channelID == 4 || channelID == 6) {
    leftChannelSource[previewId] = item;
  } else {
    rightChannelSource[previewId] = item;
  }
}

function setGroupData(groupData, groupNo) {
  if (groupNo == 1) {
    group1Data = groupData;
  }
  if (groupNo == 2) {
    group2Data = groupData;
  }
}

function getMasterHeadphoneState() {
  if (leftChannelSource[masterPreviewID] == undefined) {
    return undefined;
  } else {
    return leftChannelSource[masterPreviewID].HeadPhone;
  }
}

function saveMasterPreviewID(_previewID) {
  masterPreviewID = _previewID;
}

function initWebRtc() {
  if (myClient === null) {
    myClient = new Window.RtcClient();
    if (myClient != null) {
      myClient.init("wss://rtc.tvunetworks.com", function () { });
    }
  }
}

function disconnectRemotePeer(remoteKey) {
  window.console.log("call disconnected !!");
  myClient.stopCall(remoteKey);
}

function getSelectedChannelPair(previewId, selectedPair, userChangedPair) {
  // selectePair - 1 because array starts with 0 and we have pair starting with 1

  selectedChannelPair[previewId] = selectedPair - 1;
  if (userChangedPair) {
    let audioStream = new MediaStream();
    if (audioSource.get(previewId) !== undefined) {
      let newAudioTrack = audioSource.get(previewId)[selectedPair - 1];
      if (newAudioTrack !== undefined) {
        audioStream.addTrack(newAudioTrack);
        createAudioChannelContext(audioStream, previewId, true, true);
      } else {
        window.console.log('selected pair has no audio')
        if (audioContext[previewId].state !== 'closed' && audioContext[previewId]) {
          audioContext[previewId].close();
          // audioContext[previewId] = null;
          gainNodeLeft[previewId] = 0;
          gainNodeRight[previewId] = 0;
        }

      }
    }
  }

  window.console.log(selectedChannelPair);
}

function connectToRemotePeer(
  id,
  isRTILCode,
  isMaster,
  videoLoadingFinished,
  clickCallbackresult,
  clickCallbackresultForGroup1,
  clickCallbackresultForGroup2
) {
  connectToWebRTCPeer(
    id,
    isMaster,
    videoLoadingFinished,
    clickCallbackresult,
    clickCallbackresultForGroup1,
    clickCallbackresultForGroup2
  );
  if (isRTILCode) {
    connectToRTILPeer(
      id,
      isRTILCode,
      videoLoadingFinished,
      clickCallbackresult,
      clickCallbackresultForGroup1,
      clickCallbackresultForGroup2
    );
  }
}

function connectToWebRTCPeer(
  id,
  isMaster,
  videoLoadingFinished,
  clickCallbackresult,
  clickCallbackresultForGroup1,
  clickCallbackresultForGroup2
) {
  let r_id = id;
  let master = isMaster;
  // window.console.log(r_id);
  // if (
  //   r_id !== "FFFFFFFBB000CD0650444352415052450004" ||
  //   r_id !== "FFFFFFFBB000CD0650444352415052450000"
  // ) {
  //   return;
  // }
  if (myClient && myClient.websocket && myClient.websocket.hadLogin) {
    myClient.startCall([r_id], "video", (result) => {
      switch (result.type) {
        case "success": {
          if (successIds.includes(r_id)) {
            return;
          }
          successIds.push(r_id);

          let videoStream = new MediaStream();
          let audioStream = new MediaStream();
          videoStream.addTrack(result.msg.mediaStream.getVideoTracks()[0]);
          let audioTracks = result.msg.mediaStream.getAudioTracks();
          // if(r_id === "FFFFFFFBB000CD0D50444352415052450001"){
          //   window.console.log("audioTracks --> ", audioTracks);
          // }
          window.console.log("audioTracks --> ", audioTracks);



          // if (r_id !== masterPreviewID && audioTracks.length > 1) {
          let streamAvailable = true;
          if (r_id !== masterPreviewID && audioTracks.length > 1) {
            let pair = selectedChannelPair[r_id];
            let newAudioTrack = audioTracks[pair];

            if (newAudioTrack !== undefined) {
              audioStream.addTrack(newAudioTrack);
            } else {
              streamAvailable = false;

              // using this stream just for creating dummy context
              // because audio tracks for selected pair is not avaibale
              audioStream.addTrack(audioTracks[0]);
            }

            window.console.log("r_id");
          } else {

            audioStream.addTrack(audioTracks[0]);
            window.console.log("master");
          }

          if (audioSource.has(r_id)) {
            audioSource.delete(r_id);
            window.console.log("audioSource Map duplicate -- > ", audioSource);
          }
          let trackArray = [];
          audioTracks.map((item) => {
            trackArray.push(item);
          });
          window.console.log("trackArray --> ", trackArray);
          // need to remove hardcoded code
          audioSource.set(r_id, trackArray);
          window.console.log("audioSource --> ", audioSource);
          // callBackForAudioMeter.set(r_id, clickCallbackresult);

          window.console.log("audioSource Map added .. --> ", audioSource);

          window.console.log(
            "audio tracks recived --> ",
            result.msg.mediaStream.getAudioTracks()
          );

          // Added for master video
          if (master) {
            document.getElementById(
              r_id + "_remote_video_master"
            ).srcObject = videoStream;

            document.getElementById(
              r_id + "_remote_audio_master"
            ).srcObject = audioStream;
          } else {
            document.getElementById(
              r_id + "_remote_video"
            ).srcObject = videoStream;

            document.getElementById(
              r_id + "_remote_audio"
            ).srcObject = audioStream;
          }

          // retain current Pan state on reconnect
          let panLeft = null;
          let panRight = null;
          if (reconnect.includes(r_id)) {
            panLeft = pannerLeft[r_id].pan.value;
            panRight = pannerRight[r_id].pan.value;
          }
          audioTrack(
            audioStream,
            streamAvailable,
            r_id,
            clickCallbackresult,
            clickCallbackresultForGroup1,
            clickCallbackresultForGroup2
          );
          videoLoadingFinished(true);

          // When video loaded on reconnect, resume audio again and apply current Pan state/value
          if (reconnect.includes(r_id)) {
            resumeAudio(r_id);
            changeGainLeft(r_id);
            changeGainRight(r_id);
            pannerLeft[r_id].pan.value = panLeft;
            pannerRight[r_id].pan.value = panRight;
          }
          break;
        }
        case "callRequestRefuse": {
          removeItemFromArray(successIds, r_id);
          window.console.log("call request refuse from remote");
          break;
        }
        case "noLogin": {
          removeItemFromArray(successIds, r_id);
          window.console.log("Client Not Login... ");
          break;
        }
        case "failed": {
          removeItemFromArray(successIds, r_id);
          if (!reconnect.includes(r_id)) {
            reconnect.push(r_id);
          }
          window.console.log("Current response failed...");
          break;
        }
        case "closeVoip": {
          removeItemFromArray(successIds, r_id);
          if (reconnect.includes(r_id)) {
            removeItemFromArray(reconnect, r_id);
          }

          if (audioSource.has(r_id)) {
            audioSource.delete(r_id);
            window.console.log("audioSource Map delete --> ", audioSource);
          }

          window.console.log("Call Disconnected success...");
          break;
        }
        case "dataChannel": {
          break;
        }
        default:
          window.console.log("default case...");
          window.console.log("Error Type: ", result.type);
      }
    });
  } else {
    clearTimeout(createVideoTimer);
    createVideoTimer = setTimeout(() => {
      connectToWebRTCPeer(
        id,
        isMaster,
        videoLoadingFinished,
        clickCallbackresult,
        clickCallbackresultForGroup1,
        clickCallbackresultForGroup2
      );
    }, 300);
  }
}

function changePan(remoteKey, leftRightPanValue, channelID, sourceType) {
  if (sourceType == "stereo") {
    pannerLeft[remoteKey].pan.value = leftRightPanValue;
    pannerRight[remoteKey].pan.value = leftRightPanValue;
  } else {
    if (channelID == 0) {
      if (
        leftRightPanValue >= -1 &&
        leftRightPanValue <= 1 &&
        pannerLeft[remoteKey]
      ) {
        pannerLeft[remoteKey].pan.value = leftRightPanValue;
      }
    } else {
      if (
        leftRightPanValue >= -1 &&
        leftRightPanValue <= 1 &&
        pannerRight[remoteKey]
      ) {
        pannerRight[remoteKey].pan.value = leftRightPanValue;
      }
    }
  }
}

function muteAudio(remoteKey, channelID) {
  if (channelID == 0) {
    gainLeftBeforeMute[remoteKey] = gainNodeLeft[remoteKey].gain.value;
    gainNodeLeft[remoteKey].gain.value = 0;
  } else if (channelID == undefined || channelID == null) {
    // For Master
    gainLeftBeforeMute[remoteKey] = gainNodeLeft[remoteKey].gain.value;
    gainNodeLeft[remoteKey].gain.value = 0;
    gainRightBeforeMute[remoteKey] = gainNodeRight[remoteKey].gain.value;
    gainNodeRight[remoteKey].gain.value = 0;
  } else {
    gainRightBeforeMute[remoteKey] = gainNodeRight[remoteKey].gain.value;
    gainNodeRight[remoteKey].gain.value = 0;
  }
}

function changeGainLeft(remoteKey, groupFaderChanged, channelIndex, advanceMix) {
  if (remoteKey === masterPreviewID) {
    return;
  }
  if (gainNodeLeft[remoteKey] == undefined) {
    return;
  }

  let newGainValueForMaster = 1;

  // calculate floorValue on the basis of Source's gain/fader value
  let floorValue =
    Math.pow(10, (leftChannelSource[remoteKey].Gain + 100) / 100) *
    0.04093171969;

  // if the source is added to Groups, calculate floorValue on the basis of Groups gain/fader value
  if (leftChannelSource[remoteKey].Group == 1 && groupFaderChanged) {
    floorValue = Math.pow(10, (group1Data.Gain + 100) / 100) * 0.04093171969;
  }
  if (leftChannelSource[remoteKey].Group == 2 && groupFaderChanged) {
    floorValue = Math.pow(10, (group2Data.Gain + 100) / 100) * 0.04093171969;
  }

  let gainInPercentage = Math.floor(floorValue);
  let newGainValue = (gainInPercentage / 100) * monitorLevelFaderValue;
  if (
    leftChannelSource[masterPreviewID].HeadPhone &&
    !leftChannelSource[masterPreviewID].isMute &&
    !leftChannelSource[remoteKey].isMute &&
    leftChannelSource[remoteKey].Output
  ) {
    let floorValueForMaster = null;
    if (advanceMix) {
      floorValueForMaster =
        Math.pow(10, (leftChannelSource[masterPreviewID].Gain + 100) / 100) *
        0.04093171969;
    } else {
      floorValueForMaster =
        Math.pow(10, (leftChannelSource[masterPreviewID].Gain + 100) / 100) *
        0.04093171969;
    }
    // let floorValueForMaster =
    //   Math.pow(10, (leftChannelSource[masterPreviewID].Gain + 100) / 100) *
    //   0.04093171969;
    let gainInPercentageForMaster = Math.floor(floorValueForMaster);
    newGainValueForMaster = gainInPercentageForMaster / 100;

    // added for PP20-1032
    if (leftChannelSource[remoteKey].Group == 1 && group1Data.isMute) {
      gainNodeLeft[remoteKey].gain.value = 0;
      return;
    }
    if (leftChannelSource[remoteKey].Group == 2 && group2Data.isMute) {
      gainNodeLeft[remoteKey].gain.value = 0;
      return;
    }
    // end

    gainNodeLeft[remoteKey].gain.value = newGainValue * newGainValueForMaster;
    // console.log('gain left --> ', gainNodeLeft[remoteKey].gain.value)
  } else if (
    (leftChannelSource[remoteKey].HeadPhone &&
      !leftChannelSource[remoteKey].isMute) ||
    (group1Data !== null && group1Data.HeadPhone &&
      leftChannelSource[remoteKey].Group == 1 &&
      !group1Data.isMute &&
      !leftChannelSource[remoteKey].isMute) || leftChannelSource[remoteKey].HeadPhone
  ) {
    gainNodeLeft[remoteKey].gain.value = newGainValue;
  } else if (
    (leftChannelSource[remoteKey].HeadPhone &&
      !leftChannelSource[remoteKey].isMute) ||
    (group2Data !== null && group2Data.HeadPhone &&
      leftChannelSource[remoteKey].Group == 2 &&
      !group2Data.isMute &&
      !leftChannelSource[remoteKey].isMute) || leftChannelSource[remoteKey].HeadPhone
  ) {
    gainNodeLeft[remoteKey].gain.value = newGainValue;
  } else {
    gainNodeLeft[remoteKey].gain.value = 0;
  }
}

function changeGainRight(remoteKey, groupFaderChanged, channelIndex, advanceMix) {
  if (remoteKey === masterPreviewID) {
    return;
  }
  if (gainNodeRight[remoteKey] == undefined) {
    return;
  }
  let newGainValueForMaster = 1;

  // calculate floorValue on the basis of Source's gain/fader value
  let floorValue =
    Math.pow(10, (rightChannelSource[remoteKey].Gain + 100) / 100) *
    0.04093171969;

  // if the source is added to Groups, calculate floorValue on the basis of Groups gain/fader value
  if (rightChannelSource[remoteKey].Group == 1 && groupFaderChanged) {
    floorValue = Math.pow(10, (group1Data.Gain + 100) / 100) * 0.04093171969;
  }
  if (rightChannelSource[remoteKey].Group == 2 && groupFaderChanged) {
    floorValue = Math.pow(10, (group2Data.Gain + 100) / 100) * 0.04093171969;
  }

  let gainInPercentage = Math.floor(floorValue);
  let newGainValue = (gainInPercentage / 100) * monitorLevelFaderValue;

  if (
    leftChannelSource[masterPreviewID].HeadPhone &&
    !leftChannelSource[masterPreviewID].isMute &&
    !rightChannelSource[remoteKey].isMute &&
    rightChannelSource[remoteKey].Output
  ) {
    let floorValueForMaster = null;
    if (advanceMix) {
      floorValueForMaster =
        Math.pow(10, (leftChannelSource[masterPreviewID].Gain + 100) / 100) *
        0.04093171969;
    } else {
      floorValueForMaster =
        Math.pow(10, (leftChannelSource[masterPreviewID].Gain + 100) / 100) *
        0.04093171969;
    }
    // let floorValueForMaster =
    //   Math.pow(10, (leftChannelSource[masterPreviewID].Gain + 100) / 100) *
    //   0.04093171969;
    let gainInPercentageForMaster = Math.floor(floorValueForMaster);
    newGainValueForMaster = gainInPercentageForMaster / 100;

    // added for PP20-1032
    if (rightChannelSource[remoteKey].Group == 1 && group1Data.isMute) {
      gainNodeRight[remoteKey].gain.value = 0;
      return;
    }
    if (rightChannelSource[remoteKey].Group == 2 && group2Data.isMute) {
      gainNodeRight[remoteKey].gain.value = 0;
      return;
    }
    // end
    gainNodeRight[remoteKey].gain.value = newGainValue * newGainValueForMaster;
    // console.log('gain right --> ', gainNodeRight[remoteKey].gain.value)
  } else if (
    (rightChannelSource[remoteKey].HeadPhone &&
      !rightChannelSource[remoteKey].isMute) ||
    (group1Data !== null && group1Data.HeadPhone &&
      rightChannelSource[remoteKey].Group == 1 &&
      !group1Data.isMute &&
      !rightChannelSource[remoteKey].isMute) || rightChannelSource[remoteKey].HeadPhone
  ) {
    gainNodeRight[remoteKey].gain.value = newGainValue;
  } else if (
    (rightChannelSource[remoteKey].HeadPhone &&
      !rightChannelSource[remoteKey].isMute) ||
    (group2Data !== null && group2Data.HeadPhone &&
      rightChannelSource[remoteKey].Group == 2 &&
      !group2Data.isMute &&
      !rightChannelSource[remoteKey].isMute) || rightChannelSource[remoteKey].HeadPhone
  ) {
    gainNodeRight[remoteKey].gain.value = newGainValue;
  } else {
    gainNodeRight[remoteKey].gain.value = 0;
  }
}

function createAudioChannelContext(stream, remoteKey, userSelectedPair, streamAvailable) {
  // if(!streamAvailable){
  //   return;
  // }
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  let previousAudioContext = null;
  if (audioContext[remoteKey]) {
    previousAudioContext = audioContext[remoteKey];
  }

  audioContext[remoteKey] = new AudioContext();

  mediaStreamSource[remoteKey] = audioContext[
    remoteKey
  ].createMediaStreamSource(stream);

  merger1[remoteKey] = audioContext[remoteKey].createChannelMerger(2);
  merger2[remoteKey] = audioContext[remoteKey].createChannelMerger(2);
  inputNode[remoteKey] = audioContext[remoteKey].createGain();
  splitter[remoteKey] = audioContext[remoteKey].createChannelSplitter(2);

  const pannerOptions = {
    pan: 0
  };
  pannerLeft[remoteKey] = new StereoPannerNode(
    audioContext[remoteKey],
    pannerOptions
  );
  pannerRight[remoteKey] = new StereoPannerNode(
    audioContext[remoteKey],
    pannerOptions
  );
  mediaStreamSource[remoteKey].connect(inputNode[remoteKey]);

  inputNode[remoteKey].connect(splitter[remoteKey]);
  gainNodeLeft[remoteKey] = audioContext[remoteKey].createGain();
  gainNodeRight[remoteKey] = audioContext[remoteKey].createGain();

  splitter[remoteKey].connect(gainNodeLeft[remoteKey], 0);
  splitter[remoteKey].connect(gainNodeRight[remoteKey], 1);

  gainNodeLeft[remoteKey].connect(merger1[remoteKey], 0, 0);
  gainNodeRight[remoteKey].connect(merger2[remoteKey], 0, 1);

  merger1[remoteKey]
    .connect(pannerLeft[remoteKey])
    .connect(audioContext[remoteKey].destination);
  merger2[remoteKey]
    .connect(pannerRight[remoteKey])
    .connect(audioContext[remoteKey].destination);

  meter[remoteKey] = createAudioMeter(audioContext[remoteKey]);
  mediaStreamSource[remoteKey].connect(meter[remoteKey]);
  audioContext[remoteKey].resume();
  if (!userSelectedPair) {
    audioContext[remoteKey].suspend();
  }
  if (previousAudioContext !== null && previousAudioContext.state !== 'closed' && previousAudioContext) {
    previousAudioContext.close();
  }
  if (!streamAvailable) {
    audioContext[remoteKey].close();
    // audioContext[remoteKey] = null;
    // gainNodeLeft[remoteKey] = 0;
    // gainNodeRight[remoteKey] = 0;
  }
}

function audioTrack(
  stream,
  streamAvailable,
  remoteKey,
  clickCallback,
  clickCallbackForGroup1,
  clickCallbackForGroup2
) {
  createAudioChannelContext(stream, remoteKey, false, streamAvailable);
  if (remoteKey == masterPreviewID) {
    drawLoopMaster(remoteKey, clickCallback);
  } else {
    rtilStreamPriority[remoteKey] = false;
    drawLoop(remoteKey, clickCallback);
  }

  drawLoopGroup(clickCallbackForGroup1, clickCallbackForGroup2);
}

function resumeAudio(remoteKey) {
  if (audioContext[remoteKey] !== undefined && audioContext[remoteKey].state === "suspended") {
    audioContext[remoteKey].resume();
    muteAudio(remoteKey, 0);
    muteAudio(remoteKey, 1);
  }
}

function calculateMeterVolumeForGroups(groupNumber, groupData) {
  let outputVolume = {
    outputLeft: 0,
    outputRight: 0,
  };
  let remoteKeyForGroups = null;

  if (groupData && groupData.isMute) {
    return {
      outputVolume,
      remoteKeyForGroups
    };
  }

  for (const remoteKey in leftChannelSource) {
    if (leftChannelSource[remoteKey].Group == groupNumber && meter[remoteKey]) {
      remoteKeyForGroups = remoteKey;
      let floorValue =
        Math.pow(10, (leftChannelSource[remoteKey].Gain + 100) / 100) *
        0.04093171969;
      let gainInPercentage = Math.floor(floorValue);
      let caculatedGainForLeft = gainInPercentage / 100;

      outputVolume.outputLeft +=
        ((caculatedGainForLeft * (100 - leftChannelSource[remoteKey].Pan)) /
          100) *
        meter[remoteKey].volume[0];
    }
    if (
      rightChannelSource[remoteKey].Group == groupNumber &&
      meter[remoteKey]
    ) {
      remoteKeyForGroups = remoteKey;
      let floorValue =
        Math.pow(10, (rightChannelSource[remoteKey].Gain + 100) / 100) *
        0.04093171969;
      let gainInPercentage = Math.floor(floorValue);
      let caculatedGainForRight = gainInPercentage / 100;

      outputVolume.outputRight +=
        ((caculatedGainForRight * rightChannelSource[remoteKey].Pan) / 100) *
        meter[remoteKey].volume[1];
    }
  }

  return {
    outputVolume,
    remoteKeyForGroups
  };
}

function drawLoopGroup(clickCallbackForGroup1, clickCallbackForGroup2) {
  let outputDataForGroup1 = calculateMeterVolumeForGroups(1, group1Data);
  let outputDataForGroup2 = calculateMeterVolumeForGroups(2, group2Data);
  if (
    typeof clickCallbackForGroup1 === "function" &&
    typeof clickCallbackForGroup2 === "function"
  ) {
    if (outputDataForGroup1.outputVolume && outputDataForGroup2.outputVolume) {
      if (outputDataForGroup1.remoteKeyForGroups !== null) {
        let floorValueForGroup1 =
          Math.pow(
            10,
            (leftChannelSource[outputDataForGroup1.remoteKeyForGroups].Gain +
              100) /
            100
          ) * 0.04093171969;
        percentageLeft[outputDataForGroup1.remoteKeyForGroups] = Math.floor(
          floorValueForGroup1
        );
        floorValueForGroup1 =
          Math.pow(
            10,
            (rightChannelSource[outputDataForGroup1.remoteKeyForGroups].Gain +
              100) /
            100
          ) * 0.04093171969;
        percentageRight[outputDataForGroup1.remoteKeyForGroups] = Math.floor(
          floorValueForGroup1
        );
        let volumeLeftForGroup1 =
          (outputDataForGroup1.outputVolume.outputLeft *
            percentageLeft[outputDataForGroup1.remoteKeyForGroups]) /
          100;
        let volumeRightForGroup1 =
          (outputDataForGroup1.outputVolume.outputRight *
            percentageRight[outputDataForGroup1.remoteKeyForGroups]) /
          100;
        // condition applied for to set volume as zero, if the volume is in exponential number
        if (volumeLeftForGroup1.toString().indexOf("e") > -1) {
          volumeLeftForGroup1 = 0;
        }
        if (volumeRightForGroup1.toString().indexOf("e") > -1) {
          volumeRightForGroup1 = 0;
        }
        clickCallbackForGroup1(
          outputDataForGroup1.remoteKeyForGroups,
          [volumeLeftForGroup1, volumeRightForGroup1],
          [100, 100]
        );
      } else {
        clickCallbackForGroup1(
          outputDataForGroup1.remoteKeyForGroups,
          [0, 0],
          [100, 100]
        );
      }

      if (outputDataForGroup2.remoteKeyForGroups !== null) {
        let floorValueForGroup2 =
          Math.pow(
            10,
            (leftChannelSource[outputDataForGroup2.remoteKeyForGroups].Gain +
              100) /
            100
          ) * 0.04093171969;
        percentageLeft[outputDataForGroup2.remoteKeyForGroups] = Math.floor(
          floorValueForGroup2
        );
        floorValueForGroup2 =
          Math.pow(
            10,
            (rightChannelSource[outputDataForGroup2.remoteKeyForGroups].Gain +
              100) /
            100
          ) * 0.04093171969;
        percentageRight[outputDataForGroup2.remoteKeyForGroups] = Math.floor(
          floorValueForGroup2
        );

        let volumeLeftForGroup2 =
          (outputDataForGroup2.outputVolume.outputLeft *
            percentageLeft[outputDataForGroup2.remoteKeyForGroups]) /
          100;
        let volumeRightForGroup2 =
          (outputDataForGroup2.outputVolume.outputRight *
            percentageRight[outputDataForGroup2.remoteKeyForGroups]) /
          100;

        // condition applied for to set volume as zero, if the volume is in exponential number
        if (volumeLeftForGroup2.toString().indexOf("e") > -1) {
          volumeLeftForGroup2 = 0;
        }
        if (volumeRightForGroup2.toString().indexOf("e") > -1) {
          volumeRightForGroup2 = 0;
        }

        clickCallbackForGroup2(
          outputDataForGroup2.remoteKeyForGroups,
          [volumeLeftForGroup2, volumeRightForGroup2],
          [100, 100]
        );
      } else {
        clickCallbackForGroup2(
          outputDataForGroup2.remoteKeyForGroups,
          [0, 0],
          [100, 100]
        );
      }
    }
  }

  // }
  rafID[
    outputDataForGroup1.remoteKeyForGroups
  ] = window.requestAnimationFrame(() =>
    drawLoopGroup(clickCallbackForGroup1, clickCallbackForGroup2)
  );
}

function calculateMeterVolume() {
  let outputVolume = {
    outputLeft: 0,
    outputRight: 0,
  };
  if (leftChannelSource[masterPreviewID].isMute) {
    return outputVolume;
  }

  for (const remoteKey in leftChannelSource) {
    if (
      remoteKey === masterPreviewID ||
      !Object.prototype.hasOwnProperty.call(meter, remoteKey) // checked for undefined remotekey
    ) {
      continue;
    }
    if (leftChannelSource[remoteKey].Output) {
      // console.log(leftChannelSource[remoteKey].Gain)
      let floorValue =
        Math.pow(10, (leftChannelSource[remoteKey].Gain + 100) / 100) *
        0.04093171969;
      let gainInPercentage = Math.floor(floorValue);
      let caculatedGainForLeft = gainInPercentage / 100;
      // console.log(leftChannelSource[remoteKey].Pan)
      // console.log(meter[remoteKey].volume[0])
      outputVolume.outputLeft +=
        ((caculatedGainForLeft * (100 - leftChannelSource[remoteKey].Pan)) /
          100) *
        meter[remoteKey].volume[0];
      // console.log(leftChannelSource[remoteKey].Pan)
      outputVolume.outputRight +=
        ((caculatedGainForLeft * leftChannelSource[remoteKey].Pan) / 100) *
        meter[remoteKey].volume[0];
      // console.log(outputVolume.outputRight)
    }

    if (rightChannelSource[remoteKey].Output) {
      // console.log(rightChannelSource[remoteKey].Gain)
      let floorValue =
        Math.pow(10, (rightChannelSource[remoteKey].Gain + 100) / 100) *
        0.04093171969;
      let gainInPercentage = Math.floor(floorValue);
      let caculatedGainForRight = gainInPercentage / 100;
      outputVolume.outputLeft +=
        ((caculatedGainForRight * (100 - rightChannelSource[remoteKey].Pan)) /
          100) *
        meter[remoteKey].volume[1];
      // console.log(rightChannelSource[remoteKey].Pan)
      outputVolume.outputRight +=
        ((caculatedGainForRight * rightChannelSource[remoteKey].Pan) / 100) *
        meter[remoteKey].volume[1];
    }
  }

  return outputVolume;
}

function drawLoopMaster(remoteKey, clickCallback) {
  if (typeof clickCallback === "function") {
    let outputVolume = calculateMeterVolume();

    if (outputVolume) {
      meter[remoteKey].volume[0] = outputVolume.outputLeft;
      meter[remoteKey].volume[1] = outputVolume.outputRight;

      let floorValue =
        Math.pow(10, (leftChannelSource[remoteKey].Gain + 100) / 100) *
        0.04093171969;
      percentageLeft[remoteKey] = Math.floor(floorValue);
      percentageRight[remoteKey] = Math.floor(floorValue);
      let volumeLeft =
        (meter[remoteKey].volume[0] * percentageLeft[remoteKey]) / 100;
      let volumeRight =
        (meter[remoteKey].volume[1] * percentageRight[remoteKey]) / 100;

      // condition applied for to set volume as zero, if the volume is in exponential number
      if (volumeLeft.toString().indexOf("e") > -1) {
        volumeLeft = 0;
      }
      if (volumeRight.toString().indexOf("e") > -1) {
        volumeRight = 0;
      }

      clickCallback(remoteKey, [volumeLeft, volumeRight], [100, 100]);
    }
  }
  rafID[remoteKey] = window.requestAnimationFrame(() =>
    drawLoopMaster(remoteKey, clickCallback)
  );
}

function calculateMeterVolumeForSources(remoteKey) {
  let outputVolume = {};
  if (leftChannelSource[remoteKey].isMute || gainNodeLeft[remoteKey] === 0) {
    outputVolume.outputLeft = 0;
  }
  if (rightChannelSource[remoteKey].isMute || gainNodeRight[remoteKey] === 0) {
    outputVolume.outputRight = 0;
  }
  return outputVolume;
}

function drawLoop(remoteKey, clickCallback) {
  if (typeof clickCallback === "function") {
    let outputVolume = calculateMeterVolumeForSources(remoteKey);
    if (outputVolume && outputVolume.outputLeft !== undefined) {
      meter[remoteKey].volume[0] = outputVolume.outputLeft;
    }
    if (outputVolume && outputVolume.outputRight !== undefined) {
      meter[remoteKey].volume[1] = outputVolume.outputRight;
    }
    let floorValue =
      Math.pow(10, (leftChannelSource[remoteKey].Gain + 100) / 100) *
      0.04093171969;
    percentageLeft[remoteKey] = Math.floor(floorValue);

    floorValue =
      Math.pow(10, (rightChannelSource[remoteKey].Gain + 100) / 100) *
      0.04093171969;
    percentageRight[remoteKey] = Math.floor(floorValue);

    let volumeLeft =
      (meter[remoteKey].volume[0] * percentageLeft[remoteKey]) / 100;
    let volumeRight =
      (meter[remoteKey].volume[1] * percentageRight[remoteKey]) / 100;

    // condition applied for to set volume as zero, if the volume is in exponential number
    if (volumeLeft.toString().indexOf("e") > -1) {
      volumeLeft = 0;
    }
    if (volumeRight.toString().indexOf("e") > -1) {
      volumeRight = 0;
    }
    clickCallback(remoteKey, [volumeLeft, volumeRight], [100, 100]);
  }
  rafID[remoteKey] = window.requestAnimationFrame(() => {
    if (rtilStreamPriority[remoteKey] == false) {
      drawLoop(remoteKey, clickCallback);
    }
  });
}
// volume-meter.js;
function createAudioMeter(audioContext, clipLevel, averaging, clipLag) {
  var processor = audioContext.createScriptProcessor(256);
  processor.onaudioprocess = volumeAudioProcess;
  processor.clipping = false;
  processor.lastClip = 0;
  processor.volume = [0, 0];
  processor.clipLevel = clipLevel || 0.98;
  processor.averaging = averaging || 0.95;
  processor.clipLag = clipLag || 750;
  processor.connect(audioContext.destination);
  processor.checkClipping = function () {
    if (!this.clipping) return false;
    if (this.lastClip + this.clipLag < window.performance.now())
      this.clipping = false;
    return this.clipping;
  };
  processor.shutdown = function () {
    this.disconnect();
    this.onaudioprocess = null;
  };
  return processor;
}

function volumeAudioProcess(event) {
  var self = this;
  var buf = event.inputBuffer.getChannelData(0);
  var bufLength = buf.length;
  var x = 0;
  for (var i = 0; i < event.inputBuffer.numberOfChannels; i++) {
    buf = event.inputBuffer.getChannelData(i);
    bufLength = buf.length;
    for (var j = 0; j < bufLength; j++) {
      var sum = 0;
      x = buf[j];
      if (Math.abs(x) >= self.clipLevel) {
        self.clipping = true;
        self.lastClip = window.performance.now();
      }
      sum += x * x;
    }
    var rms = Math.sqrt(sum / bufLength);
    self.volume[i] = Math.max(rms, self.volume[i] * self.averaging);
  }
}

//Agora related code
function callbackSelfId(selfId) {
  window.console.log(selfId);
}

/*function startRtilStream(streamId, previewId, callbackAudioMeter) {
  let found = arrayRtilStream.filter(function(item) {
    return item.id == streamId;
  });
  if (!found) {
    console.log("This is an error condition... need to investigate it...");
    return false;
  }
  console.log("starting rtil stream for streamId: ", streamId);
  console.log("previewId==> : ", previewId);
  let element = document.getElementsByClassName(previewId);
  console.log("===>>>" + JSON.stringify(element));
  element[0].id = streamId;
  console.log(element[0]);
  setTimeout(function() {
    let audioStream = new MediaStream();
    let stream = mapRtilStream.get(streamId);
    console.log(stream.getAudioTrack());
    audioStream.addTrack(stream.getAudioTrack());
    audioTrack(audioStream, previewId, callbackAudioMeter, stream, true);
  }, 6000);
}*/

function startRtilStream(
  streamId,
  previewId,
  callbackAudioMeter,
  callbackAudioMeterForGroup1,
  callbackAudioMeterForGroup2
) {
  let found = arrayRtilStream.filter(function (item) {
    return item.id == streamId;
  });
  if (!found) {
    window.console.log(
      "This is an error condition... need to investigate it..."
    );
    return false;
  }

  setTimeout(function () {
    let audioStream = new MediaStream();
    let videoStream = new MediaStream();

    let stream = mapRtilStream.get(streamId);

    if (audioSource.has(previewId)) {
      audioSource.delete(previewId);
      window.console.log("audioSource Map duplicate -- > ", audioSource);
    }
    let audioTracks = stream.getAudioTrack();
    let trackArray = [];
    audioTracks.map((item) => {
      trackArray.push(item);
    });
    window.console.log("trackArray --> ", trackArray);
    // need to remove hardcoded code
    audioSource.set(previewId, trackArray);
    window.console.log("audioSource --> ", audioSource);
    let pair = selectedChannelPair[previewId];
    window.console.log(stream.getAudioTrack());
    videoStream.addTrack(stream.getVideoTrack());
    audioStream.addTrack(trackArray[pair]);

    document.getElementById(
      previewId + "_remote_video"
    ).srcObject = videoStream;

    document.getElementById(
      previewId + "_remote_audio"
    ).srcObject = audioStream;

    audioTrack(
      audioStream,
      previewId,
      callbackAudioMeter,
      callbackAudioMeterForGroup1,
      callbackAudioMeterForGroup2
    );
  }, 6000);
}

function callbackAgora(eventType, stream) {
  window.console.log("callback function 59000000");
  window.console.log("eventType --> ", eventType);

  if (eventType === "SUBSCRIBE_CLIENT") {
    let streamId = stream.getId();
    window.console.log("callbackAgora function: " + streamId);

    arrayRtilStream.push(streamId);
    mapRtilStream.set(streamId, stream);

    // let index = 0;
    // let found = false;

    rtilPreviewId.map((previewId) => {
      if (rtilKey[previewId] == streamId) {
        // rtilStreamPriority[previewId] = true;
        // index = i;
        // found = true;
        // TODO: remove previewID, rtilCallbackVolumeMeter, rtilCallbackVolumeMeterForGroup1, rtilCallbackVolumeMeterForGroup2 from connectToWebRTCPeer() success

        startRtilStream(
          streamId,
          previewId,
          rtilCallbackVolumeMeter[previewId],
          rtilCallbackVolumeMeterForGroup1[previewId],
          rtilCallbackVolumeMeterForGroup2[previewId]
        );
      }
    });
    // if(found){
    //   rtilPreviewId.splice(index, 1);
    // }
  } else if (eventType === "LEAVE_CLIENT") {
    let r_id = null;
    rtilPreviewId.map((previewId) => {
      if (rtilKey[previewId] == stream) {
        r_id = previewId;
      }
    });
    rtilKey.delete(r_id);
    // rtilPreviewId.splice(foundAt, 1);
    removeItemFromArray(rtilPreviewId, r_id);
    if (audioSource.has(r_id)) {
      audioSource.delete(r_id);
      window.console.log("audioSource Map duplicate -- > ", audioSource);
    }

    let streamId = stream;
    window.console.log("event type LEAVE_CLIENT===>>", eventType, streamId);
    removeItemFromArray(arrayRtilStream, streamId);
    mapRtilStream.delete(streamId);
  }
}

function removeItemFromArray(arr, element) {
  let foundAt = 0;
  let found = arr.filter(function (item, index) {
    foundAt = index;
    window.console.log("*******> else ", index);
    return item.id == element;
  });
  if (found) {
    arr.splice(foundAt, 1);
  }
}

let options = {
  appId: null,
  rtilChannelId: null,
  meetingToken: null,
  uid: null,
};

function callInitAgora(agoraDetails) {
  window.console.log("agora details====>>>", agoraDetails);
  //appID, channelName, tokenId, uid
  // AgoraRtcClient.init(null, callbackSelfId);
  // AgoraRtcClient.RTCEvents(callbackAgora);
  options.appId = agoraDetails.appId;
  options.rtilChannelId = agoraDetails.channel;
  options.meetingToken = agoraDetails.token;
  options.uid = agoraDetails.uId;
  AgoraRtcClient.init(
    options.appId,
    options.rtilChannelId,
    options.meetingToken,
    options.uid,
    callbackSelfId
  );
  AgoraRtcClient.RTCEvents(callbackAgora);
}

// function startAgora(){
//   console.log('startAgora====>>>')
//   AgoraRtcClient.init(options.appId, options.rtilChannelId, options.meetingToken, options.uid, callbackSelfId);
//   AgoraRtcClient.RTCEvents(callbackAgora);
// }

function connectToRTILPeer(
  previewID,
  rtilCode,
  videoLoadingFinished,
  volumeMeterCallback,
  volumeMeterCallbackForGroup1,
  volumeMeterCallbackForGroup2
) {
  window.console.log("call rtil 644444444===>>>>");
  rtilPreviewId.push(previewID);
  rtilCallbackVolumeMeter[previewID] = volumeMeterCallback;
  rtilCallbackVolumeMeterForGroup1[previewID] = volumeMeterCallbackForGroup1;
  rtilCallbackVolumeMeterForGroup2[previewID] = volumeMeterCallbackForGroup2;
  rtilKey[previewID] = rtilCode;
  window.console.log("rtilPreviewId", previewID);
  window.console.log("rtilKey", rtilKey[previewID]);

  let foundAt = 0;

  let found = arrayRtilStream.filter(function (item, index) {
    foundAt = 1;
    window.console.log("*******> ", index);
    return item.id == rtilCode;
  });
  window.console.log("found: ", found);
  if (foundAt == 1) {
    window.console.log("foundAt 1");
    startRtilStream(
      rtilKey[previewID],
      previewID,
      rtilCallbackVolumeMeter[previewID],
      rtilCallbackVolumeMeterForGroup1[previewID],
      rtilCallbackVolumeMeterForGroup2[previewID]
    );
  }
}
