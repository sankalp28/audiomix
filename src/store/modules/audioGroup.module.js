import { APIService } from "@/service/api.js";
let urlConstant = window.APIUrls;

const state = {
  audioGroupData: {},
  taskid: null,
  gainValueLocalGroup: {},
  leftRightPanValue: 0,
  selectedGroupArray: [],
  initialGainForGroup1: 0,
  initialGainForGroup2: 0,
  calculatedGainForGroup1: 0,
  calculatedGainForGroup2: 0,
  arrayForGroup1: null,
  arrayForGroup2: null,
};
const mutations = {
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
        state.initialGainForGroup1 =
          state.audioGroupData.response.Groups[0].Gain;
        state.initialGainForGroup2 =
          state.audioGroupData.response.Groups[1].Gain;
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
  setGainValue(state, payload) {
    switch (payload.type) {
      case "SETTING_GAIN_VALUE":
    }
  },
  setGainValueLocal(state, payload) {
    switch (payload.type) {
      case "SETTING_GAIN_VALUE_LOCAL":
        state.gainValueLocalGroup = payload.data;
    }
  },
  setVolumeLevel(state, payload) {
    switch (payload.type) {
      case "SETTING_VOLUME":
        state.volume = payload.data;
    }
  },
  selectedGroupArray(state, payload) {
    switch (payload.type) {
      case "SET_SELECTED_GROUP_VALUE":
        state.calculatedGainForGroup1 =
          ((state.initialGainForGroup1 + 36) * 100) / 40;
        state.calculatedGainForGroup2 =
          ((state.initialGainForGroup2 + 36) * 100) / 40;
    }
  },
  createArrayForGroup1(state, payload) {
    switch (payload.type) {
      case "SET_ARRAY_FOR_GROUP1":
        state.arrayForGroup1 = payload.data.Groups[0].ChannelIds;
    }
  },
  createArrayForGroups(state, payload) {
    switch (payload.type) {
      case "SET_ARRAY_FOR_GROUP2":
        state.arrayForGroup1 = payload.data.Groups[0].ChannelIds;
        state.arrayForGroup2 = payload.data.Groups[1].ChannelIds;
    }
  },
};
const actions = {
  actionGetAudioGroup({ commit }, _taskid) {
    commit("fetchAudioGroup", { type: "FETCHING_AUDIO_GROUP_DATA" });
    state.taskid = _taskid;
  },
  actionSetGainValue({ commit }, _gainValue) {
    commit("setGainValue", { type: "SETTING_GAIN_VALUE" });
    APIService.post(
      urlConstant.baseUrl + urlConstant.getGroups + state.taskid,
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
  actionSetSelectedGainArray({ commit }, _finalData) {
    // for gredient bar of groups
    commit("selectedGroupArray", {
      type: "SET_SELECTED_GROUP_VALUE",
      data: _finalData.dataToSend,
    });
    commit("createArrayForGroups", {
      type: "SET_ARRAY_FOR_GROUP2",
      data: _finalData.groupSources,
    });
    APIService.post(
      urlConstant.baseUrl + urlConstant.getGroups + state.taskid,
      _finalData.groupSources
    )
      .then()
      .catch((err) => {
        window.console.log("setGroupData", err);
      });
  },
  actionSetIsMuteValInDB({ commit }, _isMuteVal) {
    APIService.post(
      urlConstant.baseUrl + urlConstant.getGroups + state.taskid,
      _isMuteVal
    )
      .then(function(res) {
        commit("setGainValue", { type: "SETTING_GAIN_VALUE", data: res });
      })
      .catch((err) => {
        window.console.log("setGainValue", err);
      });
  },
};
const getters = {
  groupList(state) {
    return state.audioGroupData.response;
  },
  leftRightPanValue(state) {
    return state.leftRightPanValue;
  },
  gainValueLocalGroup(state) {
    return state.gainValueLocalGroup;
  },
  getSelectedGroupArray(state) {
    return state.selectedGroupArray;
  },
  getCalculatedGainForGroup1(state) {
    return state.calculatedGainForGroup1;
  },
  getCalculatedGainForGroup2(state) {
    return state.calculatedGainForGroup2;
  },
  getDataForGroup1: (state) => state.arrayForGroup1,
  getDataForGroup2: (state) => state.arrayForGroup2,
};
export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters,
};
