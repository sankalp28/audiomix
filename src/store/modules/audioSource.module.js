import { APIService } from "@/service/api.js";
import ReconnectingWebSocket from "reconnecting-websocket";
import { WebRtcClient } from "@/webRTC/localClient.js";

let urlConstant = window.APIUrls;
const state = {
  audioSourceData: {},
  audioGroupData: {},
  taskid: null,
  volume: {},
  volumeForGroup1: {},
  volumeForGroup2: {},
  gainValueLocal: {},
  leftRightPanValue: 0,
  localMute: [],
  localUnmute: [],
  groupDataLoaded: false,
  SourceDataLoaded: false,
  isVideoLoaded: false,
  isNewSourceAdded: false,
  unSoloArray: [],
  soloArray: [],
  videoPlayed: {},
  afvState: null,
  outputArray: [],
  speakerMuteArray: [],
  outputArray2: [],
  audioSources: {},
  isTaskDisabled: false,
  isTaskDeleted: false,
  agoraMeetingTokenData: null,
  forceUpdateKey: 0,
  horizontalScrollState: false,
  groupMute: null,
  selectedPairValueForPGM: 1,
  selectedPairValueForSource: [],
  selectedPairValueForSource2: {
    previewId: null,
    pairValue: 2
  },
  advanceMix: false,
  sourcePairChanged: false
};
const mutations = {
  test() {},
  fetchAudioGroup(state, payload) {
    switch (payload.type) {
      case "FETCHING_AUDIO_GROUP_DATA":
        state.audioGroupData = {
          isFechingAudioGroupData: true,
          errorFechingAudioGroupData: false,
          response: {},
        };
        break;
      case "FETCHED_AUDIO_GROUP_DATA":
        state.audioGroupData = {
          isFechingAudioGroupData: false,
          errorFechingAudioGroupeData: false,
          response: payload.data,
        };
        state.groupDataLoaded = true;
        state.initialGainForGroup1 =
          state.audioGroupData.response.Groups[0].Gain;
        state.initialGainForGroup2 =
          state.audioGroupData.response.Groups[1].Gain;

        // on mounted set channel sources for Groups
        state.audioGroupData.response.Groups.map((element, index) => {
          element.ChannelIds.map((item) => {
            // find source id, channel index and preview id from sources which are added into either Groups
            let channelId = item.split("-");
            let sourceID = channelId[0];
            let channelIndex = channelId[1];
            let selectedSource = state.audioSourceData.response.Sources.filter(
              (item) => {
                return item.ID == sourceID;
              }
            );
            let previewId = selectedSource[0].PreviewID;

            // add Group property to related channel
            let element = selectedSource[0].Channels[channelIndex];
            element.Group = index + 1;

            // set chennel sources with above calculated values
            WebRtcClient.setChannelSources(previewId, channelIndex, element);
            if (state.isVideoLoaded) {
              if (channelIndex == 0) {
                WebRtcClient.changeGainLeft(previewId);
              } else {
                WebRtcClient.changeGainRight(previewId);
              }
            }
          });
        });

        break;
      case "ERROR_FETCHING_AUDIO_GROUP_DATA":
        state.topicData = {
          isFechingAudioGroupData: false,
          errorFechingAudioGroupData: true,
          response: {},
        };
        break;
    }
  },
  fetchAudioSource(state, payload) {
    switch (payload.type) {
      case "FETCHED_AUDIO_SOURCE_DATA":
        state.advanceMix = payload.data.AdvanceMIX;
        // state.advanceMix = true;

        if(state.advanceMix){
          payload.data.AFV = false;
        }
        
        payload.data.Sources.forEach((element, idx) => {
          if(state.advanceMix){
            element.Balance = 50;
            if (element.Index == 1) {
              element.PairSelected = 2;
            }else{
              element.PairSelected = 1;
            }
          }

          // re indexing, if Index do not match in case of commentator
          if(element.Index !== idx+1){
            element.Index = idx+1;
          }
          
          element.Channels.forEach((item, index) => {
            // if advanceMix is On, enable output of slot 1, 2 and 3, as user will only use these slots
            if(state.advanceMix && (idx == 0 || idx == 1 || idx == 2)){
              item.Output = true;
            }

            // added 'OutputDisabled' property to maintain state of output button while switching the
            // source between dual mono to stereo and vice-versa
            if (item.OutputDisabled == undefined) {
              if (payload.data.AFV == true) {
                if (item.Output == true) {
                  item.OutputDisabled = false;
                } else {
                  item.OutputDisabled = true;
                }
              } else {
                item.OutputDisabled = false;
              }
            }

            if (item.HeadPhone == undefined) {
              item.HeadPhone = false;
            }

            WebRtcClient.setChannelSources(element.PreviewID, index, item);

            if (state.isVideoLoaded) {
              if (index == 0) {
                WebRtcClient.changeGainLeft(element.PreviewID);
              } else {
                WebRtcClient.changeGainRight(element.PreviewID);
              }
            }
          });
        });
        window.console.log('dataaa --> ', payload.data.Sources)
        WebRtcClient.saveMasterPreviewID(payload.data.Master.PreviewID);

        if(state.advanceMix){
          payload.data.Master.Channels.forEach(function(channel, channelIndex){
            if (WebRtcClient.getMasterHeadphoneState() == undefined){
              channel.HeadPhone = false;
            }else{
              channel.HeadPhone = WebRtcClient.getMasterHeadphoneState();
            }
            WebRtcClient.setChannelSources(
              payload.data.Master.PreviewID,
              channelIndex,
              payload.data.Master.Channels[channelIndex]
            );
          })
        }else{
          if (WebRtcClient.getMasterHeadphoneState() == undefined) {
            payload.data.Master.Channels[0].HeadPhone = false;
            payload.data.Master.Channels[1].HeadPhone = false;
          } else {
            payload.data.Master.Channels[0].HeadPhone = WebRtcClient.getMasterHeadphoneState();
            payload.data.Master.Channels[1].HeadPhone = WebRtcClient.getMasterHeadphoneState();
          }
          WebRtcClient.setChannelSources(
            payload.data.Master.PreviewID,
            0,
            payload.data.Master.Channels[0]
          );
          WebRtcClient.setChannelSources(
            payload.data.Master.PreviewID,
            1,
            payload.data.Master.Channels[1]
          );
        }
        

        
        state.audioSourceData = {
          isFechingAudioSourceData: false,
          errorFechingAudioSourceData: false,
          response: payload.data,
        };
        state.SourceDataLoaded = true;
        break;
      case "ERROR_FETCHING_AUDIO_SOURCE_DATA":
        state.topicData = {
          isFechingAudioSourceData: false,
          errorFechingAudioSourceData: true,
          response: {},
        };
        break;
    }
  },
  createArrayForSolo(state, payload) {
    payload.data.Sources.forEach((element) => {
      let ele = element;
      element.Channels.forEach((item, index) => {
        state.unSoloArray.push({
          pID: ele.PreviewID,
          channelIndex: index,
          isSoloActive: false,
        });
      });
    });
  },
  setSoloArray(state, payload) {
    if (state.soloArray.length) {
      let removedFromSolo = state.soloArray.pop();
      removedFromSolo.isSoloActive = false;
      state.unSoloArray.push(removedFromSolo);
    }
    let indexToRemoveFromSoloArray = null;
    state.unSoloArray.forEach((element, index) => {
      if (
        element.pID == payload.data.previewId &&
        element.channelIndex == payload.data.channelIndex
      ) {
        indexToRemoveFromSoloArray = index;
      }
    });
    let removeItemFromUnSoloArray = state.unSoloArray.splice(
      indexToRemoveFromSoloArray,
      1
    );
    removeItemFromUnSoloArray[0].isSoloActive = true;
    state.soloArray.push(removeItemFromUnSoloArray[0]);
  },
  setUnSoloArray(state, payload) {
    let indexToRemoveFromUnSoloArray = null;
    state.soloArray.forEach((element, index) => {
      if (
        element.pID == payload.data.previewId &&
        element.channelIndex == payload.data.channelIndex
      ) {
        indexToRemoveFromUnSoloArray = index;
      }
    });
    if (state.soloArray.length) {
      let removeItemFromSoloArray = state.soloArray.splice(
        indexToRemoveFromUnSoloArray,
        1
      );
      removeItemFromSoloArray[0].isSoloActive = false;
      state.unSoloArray.push(removeItemFromSoloArray[0]);
    }
  },
  setUpdatedAudioSources(state, payload) {
    state.audioSources = payload;
    state.forceUpdateKey += 1;
  },
  setGainValue(state, payload) {
    switch (payload.type) {
      case "SETTING_GAIN_VALUE":
    }
  },
  setGainValueLocal(state, payload) {
    switch (payload.type) {
      case "SETTING_GAIN_VALUE_LOCAL":
        state.gainValueLocal = payload.data;
    }
  },
  setVolumeLevel(state, payload) {
    switch (payload.type) {
      case "SETTING_VOLUME":
        state.volume = payload.data;
    }
  },
  setVolumeLevelForGroup1(state, payload) {
    switch (payload.type) {
      case "SETTING_VOLUME":
        state.volumeForGroup1 = payload.data;
    }
  },
  setVolumeLevelForGroup2(state, payload) {
    switch (payload.type) {
      case "SETTING_VOLUME":
        state.volumeForGroup2 = payload.data;
    }
  },
  addToLocalMuteArray(state, payload) {
    let indexOfSourceToBeRemoved = null;
    switch (payload.type) {
      case "SETTING_LOCAL_MUTE":
        state.localUnmute.forEach((element, index) => {
          if (
            element.channelIndex == payload.data.channelIndex &&
            element.previewId == payload.data.previewId
          ) {
            indexOfSourceToBeRemoved = index;
          }
        });
        state.localUnmute.splice(indexOfSourceToBeRemoved, 1);
        state.localMute.push(payload.data);
    }
  },
  removeFromLocalMuteArray(state, payload) {
    let indexOfSourceToBeRemoved = null;
    switch (payload.type) {
      case "SETTING_LOCAL_UNMUTE":
        state.localMute.forEach((element, index) => {
          if (
            element.channelIndex == payload.data.channelIndex &&
            element.previewId == payload.data.previewId
          ) {
            indexOfSourceToBeRemoved = index;
          }
        });
        state.localMute.splice(indexOfSourceToBeRemoved, 1);
        state.localUnmute.push(payload.data);
    }
  },
  setIsVideoLoaded(state, payload) {
    state.isVideoLoaded = payload;
  },
  addToLocalSoloArray(state, payload) {
    switch (payload.type) {
      case "SETTING_LOCAL_UNSOLO":
        state.localSolo.push(payload.data);
    }
  },
  removeFromLocalSoloArray(state, payload) {
    let indexOfSourceToBeRemoved = null;
    switch (payload.type) {
      case "SETTING_LOCAL_SOLO":
        state.localSolo.forEach((element, index) => {
          if (
            element.channelIndex == payload.data.channelIndex &&
            element.previewId == payload.data.previewId
          ) {
            indexOfSourceToBeRemoved = index;
          }
        });
        state.localSolo.splice(indexOfSourceToBeRemoved, 1);
    }
  },
  onOpenWebSocket(state, payload) {
    window.console.log(payload.data);
  },
  setVideoPlayedStatus(state, payload) {
    state.videoPlayed = payload;
  },
  setAFVState(state, payload) {
    state.afvState = payload.data;
  },
  setOutputArray(state, payload) {
    state.outputArray = [];
    payload.Sources.forEach((element) => {
      element.Channels.forEach((item, index) => {
        if (item.Output == true) {
          let outputObject = {};
          outputObject.previewID = element.PreviewID;
          outputObject.channelIndex = index;
          state.outputArray.push(outputObject);
        }
      });
    });
  },
  setOutputArray2(state, payload) {
    state.outputArray2 = [];
    payload.Sources.forEach((element) => {
      element.Channels.forEach((item, index) => {
        if (item.isMute == false) {
          let outputObject = {};
          outputObject.previewID = element.PreviewID;
          outputObject.channelIndex = index;
          state.outputArray2.push(outputObject);
        }
      });
    });
  },
  setSpeakerMuteArray(state, payload) {
    state.speakerMuteArray.push(payload);
  },
  setMeetingToken(state, payload) {
    state.agoraMeetingTokenData =
      payload.result[Object.keys(payload.result)[0]];
    window.console.log("====>>>", state.agoraMeetingTokenData);
  },
  setGroupData(state, payload) {
    state.audioGroupData.response.Groups = payload;
  },
  setHorizontalScrollState(state, payload) {
    state.horizontalScrollState = payload;
  },
  setMuteInGroup(state, payload) {
    state.groupMute = {
      mute: true,
      previewId: payload.data.previewId,
      channelIndex: payload.data.channelIndex,
    };
  },
  setSelectedPairValueForPGM(state, payload) {
    state.selectedPairValueForPGM = payload;
  },
  setselectedPairValueForSource(state, payload) {
    state.selectedPairValueForSource.push(payload);
  },
  setselectedPairValueForSource2(state, payload) {
    state.selectedPairValueForSource2 = payload;
  },
  setIsSourcePairChanged(state, payload){
    state.sourcePairChanged = payload;
  }
};
const actions = {
  actionOpenWebSocket({ commit, dispatch }) {
    const socket = new ReconnectingWebSocket(
      urlConstant.wsUrl + "?taskid=" + state.taskid
    );
    socket.addEventListener("open", () => {
      window.console.log("Connection established");
    });
    socket.addEventListener("message", (e) => {
      let message = e.data;
      state.isNewSourceAdded = false;
      commit("onOpenWebSocket", { data: message });
      if (message) {
        dispatch("actionGetAudioSource", state.taskid);
        state.isNewSourceAdded = true;
        state.videoPlayed.status = false;
      }
    });
  },
  actionGetAudioSource({ commit }, _taskid) {
    let self = this;
    commit("fetchAudioSource", { type: "FETCHING_AUDIO_SOURCE_DATA" });
    state.taskid = _taskid;
    APIService.get(urlConstant.baseUrl + urlConstant.getGains + _taskid)
      .then((res) => {
        if (res.data) {
          commit("fetchAudioSource", {
            type: "FETCHED_AUDIO_SOURCE_DATA",
            data: res.data,
          });
          commit("createArrayForSolo", { data: res.data });
          commit("setOutputArray", res.data);
        }
      })
      .then(() => {
        APIService.get(
          urlConstant.baseUrl + urlConstant.getGroups + state.taskid
        ).then((res) => {
          if (res.data) {
            if (Object.keys(res.data).length === 0) {
              commit("fetchAudioGroup", {
                type: "FETCHED_AUDIO_GROUP_DATA",
                data: {
                  Groups: [
                    {
                      GroupName: "Group 1",
                      isMute: false,
                      Gain: 238,
                      ChannelIds: [],
                      HeadPhone: false,
                      isEnabled: false,
                    },
                    {
                      GroupName: "Group 2",
                      isMute: false,
                      Gain: 238,
                      ChannelIds: [],
                      HeadPhone: false,
                      isEnabled: false,
                    },
                  ],
                },
              });
            } else {
              res.data.Groups.map((element) => {
                element.HeadPhone = false;
              });
              commit("fetchAudioGroup", {
                type: "FETCHED_AUDIO_GROUP_DATA",
                data: res.data,
              });
            }
          }
        });
        // document.cookie = "SID=8E67FF6162BE478CBA24974682B7BE6D";
        APIService.post(
          urlConstant.gatewayBaseUrl + urlConstant.getMeetingToken,
          {
            productionId:
              self.state.audioSource.audioSourceData.response.productionId,
            channels: [
              self.state.audioSource.audioSourceData.response.productionId,
            ],
          }
          // ,
          // {
          //   headers: {
          //     SID: "B9BA9965E9FE45C697CD467F9D34A6BF",
          //   },
          // }
        )
          .then((res) => {
            if (res.data) {
              commit("setMeetingToken", res.data);
            }
          })
          .catch((error) => {
            window.console.log(error);
          });
      })
      .catch((error) => {
        window.console.log(error);
      });
  },
  actionUpdateAudioSourcesByGainValue({ commit }, _updatedAudioSources) {
    commit("setUpdatedAudioSources", _updatedAudioSources);
  },
  actionSetGainValue({ commit }, _gainValue) {
    commit("setGainValue", { type: "SETTING_GAIN_VALUE" });
    APIService.post(
      urlConstant.baseUrl + urlConstant.getGains + state.taskid,
      _gainValue
    )
      .then()
      .catch((err) => {
        window.console.log("setGainValue", err);
      });
  },
  actionSetGainValueForLocal({ commit }, _gainValueLocal) {
    commit("setGainValueLocal", {
      type: "SETTING_GAIN_VALUE_LOCAL",
      data: _gainValueLocal,
    });
  },
  actionSetVolume({ commit }, _volume) {
    commit("setVolumeLevel", { type: "SETTING_VOLUME", data: _volume });
  },
  actionSetVolumeForGroup1({ commit }, _volume) {
    commit("setVolumeLevelForGroup1", {
      type: "SETTING_VOLUME",
      data: _volume,
    });
  },
  actionSetVolumeForGroup2({ commit }, _volume) {
    commit("setVolumeLevelForGroup2", {
      type: "SETTING_VOLUME",
      data: _volume,
    });
  },
  actionSetLocalMute({ commit }, _muteState) {
    commit("addToLocalMuteArray", {
      type: "SETTING_LOCAL_MUTE",
      data: _muteState,
    });
  },
  actionSetLocalUnMute({ commit }, _muteState) {
    commit("removeFromLocalMuteArray", {
      type: "SETTING_LOCAL_UNMUTE",
      data: _muteState,
    });
  },
  actionSetIsMuteArray({ commit }, _muteDataArray) {
    commit("setSpeakerMuteArray", _muteDataArray);
  },
  actionSetIsMuteValue({ commit }, _gainValue) {
    commit("setOutputArray2", _gainValue);
    APIService.post(
      urlConstant.baseUrl + urlConstant.getGains + state.taskid,
      _gainValue
    )
      .then(function(response) {
        if (response.status == 200) {
          commit("setGainValue", { type: "SETTING_GAIN_VALUE" });
        }
      })
      .catch((err) => {
        window.console.log("setGainValue", err);
      });
  },
  actionIsVideoLoaded({ commit }, _isVideoLoaded) {
    commit("setIsVideoLoaded", { data: _isVideoLoaded });
  },
  actionSetLocalSolo({ commit }, _soloState) {
    commit("removeFromLocalSoloArray ", {
      type: "SETTING_LOCAL_SOLO",
      data: _soloState,
    });
  },

  actionSetLocalUnSolo({ commit }, _soloState) {
    commit("addToLocalSoloArray", {
      type: "SETTING_LOCAL_UNSOLO",
      data: _soloState,
    });
  },
  actionSetIsSoloValue({ commit }, _gainValue) {
    APIService.post(
      urlConstant.baseUrl + urlConstant.getGains + state.taskid,
      _gainValue
    )
      .then(function(response) {
        if (response.status == 200) {
          commit("setGainValue", { type: "SETTING_GAIN_VALUE" });
        }
      })
      .catch((err) => {
        window.console.log("setGainValue", err);
      });
  },
  actionSetSoloArray({ commit }, _unSoloData) {
    commit("setSoloArray", { data: _unSoloData });
  },
  actionSetUnSoloArray({ commit }, _soloData) {
    commit("setUnSoloArray", { data: _soloData });
  },
  actionSetVidePlayedStatus({ commit }, _status) {
    commit("setVideoPlayedStatus", _status);
  },
  actionSetPanValueLevel({ commit }, _gainValue) {
    APIService.post(
      urlConstant.baseUrl + urlConstant.getGains + state.taskid,
      _gainValue
    )
      .then(function(response) {
        if (response.status == 200) {
          commit("setGainValue", { type: "SETTING_GAIN_VALUE" });
        }
      })
      .catch((err) => {
        window.console.log("setGainValue", err);
      });
  },
  actionSetIsOutputTrue({ commit }, _gainValue) {
    commit("setOutputArray", _gainValue);

    APIService.post(
      urlConstant.baseUrl + urlConstant.getGains + state.taskid,
      _gainValue
    )
      .then(function(response) {
        if (response.status == 200) {
          commit("setGainValue", { type: "SETTING_GAIN_VALUE" });
        }
      })
      .catch((err) => {
        window.console.log("setGainValue", err);
      });
  },
  actionSetAFVState({ commit, dispatch }, _afvState) {
    APIService.post(
      urlConstant.baseUrl + urlConstant.getGains + state.taskid,
      _afvState.audioSources
    )
      .then(function(response) {
        if (response.status == 200) {
          commit("setAFVState", { data: _afvState.afvState });
          if (_afvState.afvState) {
            dispatch("actionGetAudioSource", state.taskid);
          }
        }
      })
      .catch((err) => {
        window.console.log("setGainValue", err);
      });
  },

  // actions for Group feature
  actionSetSelectedSourceInGroup1({ commit, dispatch }, _data) {
    // push selected source in Group 1 Array
    if (
      state.audioGroupData.response.Groups[0].ChannelIds.indexOf(
        _data.sourceID
      ) < 0
    ) {
      state.audioGroupData.response.Groups[0].ChannelIds.push(_data.sourceID);
      if (state.audioGroupData.response.Groups[0].isMute) {
        commit("setMuteInGroup", { data: _data });
      }
    }

    // remove selected source if its already added in Group 2
    dispatch("actionRemoveSelectedSourceFromGroup2", _data.sourceID);

    // send updated Group data to API
    APIService.post(
      urlConstant.baseUrl + urlConstant.getGroups + state.taskid,
      state.audioGroupData.response
    )
      .then()
      .catch((err) => {
        window.console.log("setGainValue", err);
      });
  },
  actionRemoveSelectedSourceFromGroup1({ commit }, _data) {
    // check if selected source is added in Group 1 or not
    let pos = state.audioGroupData.response.Groups[0].ChannelIds.indexOf(
      _data.sourceID
    );

    // if selected source is present in Group 1, then remove it from Group 1 Array
    if (pos >= 0) {
      state.audioGroupData.response.Groups[0].ChannelIds.splice(pos, 1);
    }

    // send updated Group data to API
    APIService.post(
      urlConstant.baseUrl + urlConstant.getGroups + state.taskid,
      state.audioGroupData.response
    )
      .then()
      .catch((err) => {
        window.console.log("setGainValue", err);
      });

    // TODO: Move this action in mixins/common.js file, if commit is not being used here
    // trigger a dummy commit
    commit("test");
  },
  actionSetSelectedSourceInGroup2({ commit, dispatch }, _data) {
    // push selected source in Group 2 Array
    if (
      state.audioGroupData.response.Groups[1].ChannelIds.indexOf(
        _data.sourceID
      ) < 0
    ) {
      state.audioGroupData.response.Groups[1].ChannelIds.push(_data.sourceID);
      if (state.audioGroupData.response.Groups[1].isMute) {
        commit("setMuteInGroup", { data: _data });
      }
    }

    // remove selected source if its already added in Group 1
    dispatch("actionRemoveSelectedSourceFromGroup1", _data.sourceID);

    // send updated Group data to API
    APIService.post(
      urlConstant.baseUrl + urlConstant.getGroups + state.taskid,
      state.audioGroupData.response
    )
      .then()
      .catch((err) => {
        window.console.log("setGainValue", err);
      });
  },
  actionRemoveSelectedSourceFromGroup2({ commit }, _data) {
    // check if selected source is added in Group 2 or not
    let pos = state.audioGroupData.response.Groups[1].ChannelIds.indexOf(
      _data.sourceID
    );

    // if selected source is present in Group 2, then remove it from Group 2 Array
    if (pos >= 0) {
      state.audioGroupData.response.Groups[1].ChannelIds.splice(pos, 1);
    }

    // send updated Group data to API
    APIService.post(
      urlConstant.baseUrl + urlConstant.getGroups + state.taskid,
      state.audioGroupData.response
    )
      .then()
      .catch((err) => {
        window.console.log("setGainValue", err);
      });

    // TODO: Move this action in mixins/common.js file, if commit is not being used here
    // trigger a dummy commit
    commit("test");
  },
  actionSetHeadPhoneStateInGroup({ commit }, groupData) {
    commit("setGroupData", groupData);
  },
  actionHandleHorizontalScroll({ commit }, horizontalScrollState) {
    commit("setHorizontalScrollState", horizontalScrollState);
  },
  actionSetSelectedPairValueForPGM({ commit }, selectedPairValueForPGM) {
    commit("setSelectedPairValueForPGM", selectedPairValueForPGM);
  },
  actionSetSelectedPairValueForSource({ commit }, selectedPairValueForSource) {
    commit("setselectedPairValueForSource", selectedPairValueForSource);
  },
  actionSetSelectedPairValueForSource2({ commit }, selectedPairValueForSource2) {
    commit("setselectedPairValueForSource2", selectedPairValueForSource2);
  },
  actionSetIsSourcePairChanged({commit}, sourcePairChanged){
    commit("setIsSourcePairChanged", sourcePairChanged)
  }
};
const getters = {
  groupList(state) {
    return state.audioGroupData.response;
  },
  channelList(state) {
    return state.audioSourceData.response;
  },
  leftRightPanValue(state) {
    return state.leftRightPanValue;
  },
  gainValueLocal(state) {
    return state.gainValueLocal;
  },
  getUnSoloArray(state) {
    return state.unSoloArray;
  },
  getSoloArray(state) {
    return state.soloArray;
  },
  getGroup1Gain(state) {
    return state.audioGroupData.response.Groups[0].Gain;
  },
  getGroup2Gain(state) {
    return state.audioGroupData.response.Groups[1].Gain;
  },
};
export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters,
};
