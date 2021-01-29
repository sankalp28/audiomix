<template>
  <div>
    <div
      :class="['repeat', getBorder()]"
      v-for="(c, index) in channelsToRepeat - 1"
      :key="index"
    >
      <!-- <LeftRightStereoButton
        :previewId="previewId"
        :channelIndex="index"
        :isMute="gain[index].isMute"
        :isSolo="gain[index].isSolo"
        :isOutput="gain[index].Output"
        :isOutputDisabled="gain[index].OutputDisabled"
      /> -->
      <Headphone
        :previewId="previewId"
        :channelIndex="index"
        :sourceId="sourceId"
        :isMute="!gain[selectedPairValue1ForSource].isMute"
        :balance="-1"
      />
      <div class="slider">
        <div class="range-slide">
          <div class="range-box">
            <!-- <GroupButtonsStereo
              :active1="isActive(sourceId, index, 0)"
              :active2="isActive(sourceId, index, 1)"
              :sourceId="sourceId"
              :index="index"
              :previewId="previewId"
              :isMute="gain[index].isMute"
              @updateGroup="updateGroup"
            /> -->
            <LeftRightControl
              :previewId="previewId"
              :channelIndex="selectedPairValue1ForSource"
              :panValue="gain[selectedPairValue1ForSource].Pan"
              sourceType="stereo"
            />

            <div class="slider-vert slider-vert-sterio">
              <div class="slider-large2 clone2">
                <vu-meter
                  :val="index == 0 ? gainVal0 : gainVal1"
                  :height="440"
                  :width="4"
                  :previewId="previewId"
                  :channelIndex="selectedPairValue1ForSource"
                  :newVolumePercentage="index == 0 ? newVolume0 : newVolume1"
                ></vu-meter>
              </div>
              <!-- {{ selectedPairValue1ForSource }}
              ::{{ gainValue }};; -->
              <div class="slider-large">
                <el-slider
                  ref="faderSlider"
                  v-model="gainValue[selectedPairValue1ForSource]"
                  vertical
                  :show-tooltip="false"
                  height="440px"
                  :marks="marks"
                  :max="299"
                  :min="0"
                  @input="handleGainIncrementValueChange"
                  :disabled="isFaderDisabled"
                ></el-slider>
              </div>
              <div class="slider-large2">
                <vu-meter
                  :val="index == 0 ? gainVal0 : gainVal1"
                  :height="440"
                  :width="4"
                  :previewId="previewId"
                  :channelIndex="selectedPairValue1ForSource"
                  :newVolumePercentage="index == 0 ? newVolume0 : newVolume1"
                ></vu-meter>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="single-2mute">
        <ChannelActionButtonsStereo
          :previewId="previewId"
          :channelIndex="index"
          :isMute="gain[index].isMute"
          :isSolo="gain[index].isSolo"
          :isOutput="gain[index].Output"
          :sourceIndex="sourceIndex"
        />
      </div>
    </div>
  </div>
</template>
<script>
import VuMeter from "./VuMeter.vue";
// import GroupButtonsStereo from "./GroupButtonsStereo.vue";
import LeftRightControl from "./LeftRightControl.vue";
//import ChannelActionButtons from "./ChannelActionButtons.vue";
import Headphone from "./Headphone.vue";
import { mapState } from "vuex";
import { WebRtcClient } from "../webRTC/localClient";
// import LeftRightStereoButton from "./LeftRightStereoButton.vue";
import ChannelActionButtonsStereo from "./ChannelActionButtonsStereo.vue";
import _ from "lodash";
export default {
  components: {
    "vu-meter": VuMeter,
    // GroupButtonsStereo,
    LeftRightControl,
    Headphone,
    // LeftRightStereoButton,
    ChannelActionButtonsStereo,
  },
  props: {
    channelsToRepeat: {
      type: Number,
    },
    gain: {
      type: Array,
    },
    sourceName: {
      type: String,
    },
    sourceId: {
      type: String,
    },
    previewId: {
      type: String,
    },
    pairSelected: {
      type: Number,
    },
    sourceIndex: {
      type: Number,
    },
  },
  data() {
    return {
      faderDifference: 0,
      peakValue: [],
      gainValue: [238, 238, 238, 238],
      marks: {
        299: "+12",
        269: "+6",
        239: "0",
        209: "-6",
        179: "-12",
        149: "-18",
        119: "-24",
        89: "-30",
        0: "-∞",
      },
      gainVal0: 0,
      gainVal1: 0,
      newVolume0: 0,
      newVolume1: 0,
      selectedPairValue1ForSource: 0,
      selectedPairValue2ForSource: 1,
      isFaderDisabled: false,
    };
  },
  created() {
    // let self = this;
    // this.selectedPairValueForSource.forEach((item) => {
    //   if(item.previewId == self.previewId){
    //     self.gain.forEach((element, index) => {
    //       if(item.pairValue == 2 && index == 2 || item.pairValue == 2 && index == 3){
    //         self.gainValue.push(element.AdvanceGain[index]);
    //       }else if(item.pairValue == 1 && index == 0 || item.pairValue == 1 && index == 1){
    //         self.gainValue.push(element.AdvanceGain[index]);
    //       }else if(item.pairValue == 4 && index == 6 || item.pairValue == 4 && index == 7){
    //         self.gainValue.push(element.AdvanceGain[index]);
    //       }
    // });
    //   }
    // })
    // this.gain.forEach((element) => {
    //   this.gainValue.push(element.Gain);
    // });
  },
  computed: {
    ...mapState({
      volume: (state) => state.audioSource.volume,
      audioGroups: (state) => state.audioSource.audioGroupData.response,
      audioSources: (state) => state.audioSource.audioSourceData.response,
      sourcePairChanged: (state) => state.audioSource.sourcePairChanged,
      selectedPairValueForSource: (state) =>
        state.audioSource.selectedPairValueForSource,
      selectedPairValueForPGM: (state) =>
        state.audioSource.selectedPairValueForPGM,
      group1Gain: (state) =>
        state.audioSource.audioGroupData.response.Groups[0].Gain,
      group2Gain: (state) =>
        state.audioSource.audioGroupData.response.Groups[1].Gain,
    }),
  },
  mounted() {
    // let self = this;
    let faderRunway = this.$refs.faderSlider[0].$el.getElementsByClassName(
      "el-slider__runway"
    )[0];

    let clonedMarks = this.$refs.faderSlider[0].$el
      .getElementsByClassName("el-slider__marks")[0]
      .cloneNode(true);

    clonedMarks.classList.add("stereoLeftMarks");

    faderRunway.appendChild(clonedMarks);

    switch (this.pairSelected) {
      case 1:
        this.selectedPairValue1ForSource = 0;
        this.selectedPairValue2ForSource = 1;
        break;
      case 2:
        this.selectedPairValue1ForSource = 0;
        this.selectedPairValue2ForSource = 3;
        break;
      case 3:
        this.selectedPairValue1ForSource = 0;
        this.selectedPairValue2ForSource = 5;
        break;
      case 4:
        this.selectedPairValue1ForSource = 0;
        this.selectedPairValue2ForSource = 7;
        break;
      default:
        break;
    }

    // hardcoded as of now, need to find a solution
    // if (self.sourceIndex == 1) {
    //   if (
    //     self.gain[2].AdvanceGain[0] !== 0 &&
    //     self.gain[3].AdvanceGain[1] !== 0
    //   ) {
    //     self.gainValue.push(self.gain[2].AdvanceGain[0]);
    //     self.gainValue.push(self.gain[3].AdvanceGain[1]);
    //   }
    // } else {
    //   self.gainValue.push(self.gain[0].AdvanceGain[0]);
    //   self.gainValue.push(self.gain[1].AdvanceGain[1]);
    // }
  },
  watch: {
    // pairSelected() {
    //   alert(this.pairSelected);
    //   const pairSelected = this.pairSelected;
    //   this.audioSources.Sources.map((source, sourceIndex) => {
    //     if (sourceIndex === 0) {
    //       source.Channels.map(() => {
    //         if (pairSelected === 1) {
    //           self.gainValue = [
    //             source.Channels[0].AdvanceGain[0],
    //             source.Channels[1].AdvanceGain[1],
    //           ];
    //         } else if (pairSelected === 2) {
    //           self.gainValue = [
    //             source.Channels[2].AdvanceGain[0],
    //             source.Channels[3].AdvanceGain[1],
    //           ];
    //         } else if (pairSelected === 3) {
    //           self.gainValue = [
    //             source.Channels[4].AdvanceGain[0],
    //             source.Channels[5].AdvanceGain[1],
    //           ];
    //         } else if (pairSelected === 4) {
    //           self.gainValue = [
    //             source.Channels[6].AdvanceGain[0],
    //             source.Channels[7].AdvanceGain[1],
    //           ];
    //         }
    //       });
    //     }
    //   });
    // },
    volume() {
      if (this.previewId === this.volume.previewId) {
        this.gainVal0 = this.volume.value[0];
        this.gainVal1 = this.volume.value[1];
        this.newVolume0 = this.volume.newVolumeValue[0];
        this.newVolume1 = this.volume.newVolumeValue[1];
      }
    },
    group1Gain() {
      let previewId = null;
      let self = this;
      this.audioGroups.Groups[0].ChannelIds.map((element) => {
        // find source id, channel index and preview id from sources which are added into either Groups
        let channelId = element.split("-");
        let sourceID = channelId[0];
        let selectedSource = self.audioSources.Sources.filter((item) => {
          return item.ID == sourceID;
        });
        previewId = selectedSource[0].PreviewID;
        if (self.previewId == previewId) {
          this.$set(this.gainValue, 0, self.group1Gain);
          this.$set(this.gainValue, 1, self.group1Gain);
        }
      });
    },
    group2Gain() {
      let previewId = null;
      let self = this;
      this.audioGroups.Groups[1].ChannelIds.map((element) => {
        // find source id, channel index and preview id from sources which are added into either Groups
        let channelId = element.split("-");
        let sourceID = channelId[0];
        let selectedSource = self.audioSources.Sources.filter((item) => {
          return item.ID == sourceID;
        });
        previewId = selectedSource[0].PreviewID;
        if (self.previewId == previewId) {
          this.$set(this.gainValue, 0, self.group2Gain);
          this.$set(this.gainValue, 1, self.group2Gain);
        }
      });
    },
    selectedPairValueForSource() {
      let self = this;
      this.selectedPairValueForSource.forEach((item) => {
        if (self.previewId === item.previewId) {
          switch (item.pairValue) {
            case 1:
              self.selectedPairValue1ForSource = 0;
              self.selectedPairValue2ForSource = 1;
              break;
            case 2:
              self.selectedPairValue1ForSource = 1;
              self.selectedPairValue2ForSource = 3;
              break;
            case 3:
              self.selectedPairValue1ForSource = 2;
              self.selectedPairValue2ForSource = 5;
              break;
            case 4:
              self.selectedPairValue1ForSource = 3;
              self.selectedPairValue2ForSource = 7;
              break;
            default:
              break;
          }
        }
      });
    },
    selectedPairValueForPGM() {
      let self = this;

      // clone the original object
      let data = JSON.parse(JSON.stringify(this.audioSources));
      if (
        this.selectedPairValueForPGM === 2 ||
        this.selectedPairValueForPGM === 3 ||
        this.selectedPairValueForPGM === 4
      ) {
        if (this.sourceIndex !== 1) {
          data.Sources.map((item) => {
            if (item.PreviewID == this.previewId) {
              item.Channels.map((item, index) => {
                item.Output = false;
                WebRtcClient.setChannelSources(self.previewId, index, item);
              });
            }
          });
          WebRtcClient.changeGainLeft(this.previewId);
          WebRtcClient.changeGainRight(this.previewId);
        } else {
          data.Sources.map((item) => {
            if (item.PreviewID == this.previewId) {
              item.Channels.map((item, index) => {
                item.Output = true;
                WebRtcClient.setChannelSources(self.previewId, index, item);
              });
            }
          });
          WebRtcClient.changeGainLeft(this.previewId);
          WebRtcClient.changeGainRight(this.previewId);
        }
      } else {
        data.Sources.map((item) => {
          if (item.PreviewID == self.previewId) {
            if (
              self.sourceIndex == 1 ||
              self.sourceIndex == 2 ||
              self.sourceIndex == 3
            ) {
              item.Channels.map((item, index) => {
                item.Output = true;
                WebRtcClient.setChannelSources(self.previewId, index, item);
              });
            }
          }
        });
        WebRtcClient.changeGainLeft(this.previewId);
        WebRtcClient.changeGainRight(this.previewId);
      }
    },
  },
  methods: {
    getBorder() {
      if (this.selectedPairValueForPGM === 1) {
        if (
          this.sourceIndex === 1 ||
          this.sourceIndex === 2 ||
          this.sourceIndex === 3
        ) {
          this.isFaderDisabled = false;
        }
        return this.sourceIndex === 1 ||
          this.sourceIndex === 2 ||
          this.sourceIndex === 3
          ? "orange-border-top"
          : "orange-border-top-filler";
      } else if (
        this.selectedPairValueForPGM === 2 ||
        this.selectedPairValueForPGM === 3 ||
        this.selectedPairValueForPGM === 4
      ) {
        if (
          this.sourceIndex === 1 ||
          this.sourceIndex === 2 ||
          this.sourceIndex === 3
        ) {
          this.isFaderDisabled = true;
        }
        return this.sourceIndex === 1
          ? "green-border-top"
          : "orange-border-top-filler";
      }
    },
    updateGroup(_input) {
      if (_input.isActive == true) {
        let data = _input.sourceId + "-" + _input.channelId;
        let index = this.audioGroups.Groups[
          _input.channelId
        ].ChannelIds.indexOf(data);
        if (index < 0) {
          this.audioGroups.Groups[_input.channelId].ChannelIds.push(data);
        }
      } else {
        let data = _input.sourceId + "-" + _input.channelId;
        let index = this.audioGroups.Groups[
          _input.channelId
        ].ChannelIds.indexOf(data);
        if (index >= 0) {
          this.audioGroups.Groups[_input.channelId].ChannelIds.splice(index, 1);
        }
      }
    },
    isActive(_sourceId, _index, _groupIndex) {
      let flag = false;
      let data = [];

      if (this.audioGroups && this.audioGroups.Groups) {
        let group = this.audioGroups.Groups[_groupIndex];
        let ChannelIds = group.ChannelIds;
        let combine = this.sourceId + "-" + _index;
        data = ChannelIds.filter((item) => {
          return item == combine;
        });
      }
      flag = data.length ? true : false;
      return flag;
    },
    handleGainIncrementValueChange: _.throttle(function () {
      const self = this;
      this.audioSources.Sources.map((source) => {
        if (source.PreviewID == self.previewId) {
          // source.PairSelected = self.pairValue;
          if (source.Index == 1) {
            if (self.sourcePairChanged) {
              if (source.Index == 1) {
                source.Channels.forEach((channel, channelIndex) => {
                  let previewID = self.previewId;
                  let gainValueLocal = self.gainValue;
                  if (
                    (source.PairSelected === 1 && channelIndex === 0) ||
                    (source.PairSelected === 2 && channelIndex === 2) ||
                    (source.PairSelected === 3 && channelIndex === 4)
                  ) {
                    channel.AdvancePan.map((pan, panIndex) => {
                      if (panIndex === 0) {
                        self.$set(channel.AdvancePan, panIndex, 100);
                      }
                      // else {
                      //   self.$set(channel.AdvanceGain, gainIndex, 0);
                      // }
                    });
                    channel.Gain =
                      self.gainValue[self.selectedPairValue1ForSource];
                    channel.AdvanceGain.map((gain, gainIndex) => {
                      if (gainIndex === 0) {
                        self.$set(
                          channel.AdvanceGain,
                          gainIndex,
                          self.gainValue[self.selectedPairValue1ForSource]
                        );
                      }
                      // else {
                      //   self.$set(channel.AdvanceGain, gainIndex, 0);
                      // }
                    });
                    WebRtcClient.setChannelSources(self.previewId, 0, channel);
                    self.$store.dispatch(
                      "audioSource/actionSetGainValueForLocal",
                      {
                        gainValue: gainValueLocal,
                        previewID,
                        channelID: 0,
                      }
                    );
                  } else if (
                    (source.PairSelected === 1 && channelIndex === 1) ||
                    (source.PairSelected === 2 && channelIndex === 3) ||
                    (source.PairSelected === 3 && channelIndex === 5)
                  ) {
                    channel.AdvancePan.map((pan, panIndex) => {
                      if (panIndex === 1) {
                        self.$set(channel.AdvancePan, panIndex, 100);
                      }
                      // else {
                      //   self.$set(channel.AdvanceGain, gainIndex, 0);
                      // }
                    });
                    channel.Gain =
                      self.gainValue[self.selectedPairValue1ForSource];
                    channel.AdvanceGain.map((gain, gainIndex) => {
                      if (gainIndex === 1) {
                        self.$set(
                          channel.AdvanceGain,
                          gainIndex,
                          self.gainValue[self.selectedPairValue1ForSource]
                        );
                      }
                      // else {
                      //   self.$set(channel.AdvanceGain, gainIndex, 0);
                      // }
                    });
                    WebRtcClient.setChannelSources(self.previewId, 1, channel);
                    self.$store.dispatch(
                      "audioSource/actionSetGainValueForLocal",
                      {
                        gainValue: gainValueLocal,
                        previewID,
                        channelID: 1,
                      }
                    );
                  }
                });
              }
            } else {
              source.Channels.forEach((channel, channelIndex) => {
                let previewID = self.previewId;
                let gainValueLocal = self.gainValue;
                // channel.AdvanceGain = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
                if (channelIndex == 0) {
                  channel.AdvancePan.forEach((pan, panIndex) => {
                    if (panIndex === 2) {
                      self.$set(channel.AdvancePan, panIndex, 100);
                    } else {
                      self.$set(channel.AdvancePan, panIndex, 0);
                    }
                  });
                  // if (
                  //   self.selectedPairValueForSource[source.Index - 1].pairValue == 1
                  // ) {
                  channel.Gain =
                    self.gainValue[self.selectedPairValue1ForSource]; // channel.Gain is used for webRTC audio only
                  channel.AdvanceGain.forEach((gain, gainIndex) => {
                    if (gainIndex === 2) {
                      self.$set(channel.AdvanceGain, gainIndex, 238);
                    } else {
                      self.$set(channel.AdvanceGain, gainIndex, 0);
                    }
                  });
                  WebRtcClient.setChannelSources(self.previewId, 0, channel);
                  self.$store.dispatch(
                    "audioSource/actionSetGainValueForLocal",
                    {
                      gainValue: gainValueLocal,
                      previewID,
                      channelID: 0,
                    }
                  );
                  // }
                }
                if (channelIndex == 1) {
                  channel.AdvancePan.forEach((pan, panIndex) => {
                    if (panIndex === 3) {
                      self.$set(channel.AdvancePan, panIndex, 100);
                    } else {
                      self.$set(channel.AdvancePan, panIndex, 0);
                    }
                  });
                  // if (
                  //   self.selectedPairValueForSource[source.Index - 1].pairValue == 1
                  // ) {
                  channel.Gain =
                    self.gainValue[self.selectedPairValue1ForSource]; // channel.Gain is used for webRTC audio only
                  channel.AdvanceGain.forEach((gain, gainIndex) => {
                    if (gainIndex === 3) {
                      self.$set(channel.AdvanceGain, gainIndex, 238);
                    } else {
                      self.$set(channel.AdvanceGain, gainIndex, 0);
                    }
                  });
                  WebRtcClient.setChannelSources(self.previewId, 1, channel);
                  self.$store.dispatch(
                    "audioSource/actionSetGainValueForLocal",
                    {
                      gainValue: gainValueLocal,
                      previewID,
                      channelID: 1,
                    }
                  );
                  // }
                }
                if (channelIndex == 2) {
                  channel.AdvancePan.forEach((pan, panIndex) => {
                    if (panIndex === 0) {
                      self.$set(channel.AdvancePan, panIndex, 100);
                    } else if (panIndex === 4) {
                      self.$set(channel.AdvancePan, panIndex, 100);
                    } else {
                      self.$set(channel.AdvancePan, panIndex, 0);
                    }
                  });
                  // if (
                  //   self.selectedPairValueForSource[source.Index - 1].pairValue == 2
                  // ) {
                  channel.Gain =
                    self.gainValue[self.selectedPairValue1ForSource]; // channel.Gain is used for webRTC audio only
                  channel.AdvanceGain.forEach((gain, gainIndex) => {
                    if (gainIndex === 0) {
                      self.$set(
                        channel.AdvanceGain,
                        gainIndex,
                        self.gainValue[self.selectedPairValue1ForSource]
                      );
                    } else if (gainIndex === 4) {
                      self.$set(channel.AdvanceGain, gainIndex, 238);
                    } else {
                      self.$set(channel.AdvanceGain, gainIndex, 0);
                    }
                    WebRtcClient.setChannelSources(self.previewId, 0, channel);
                    self.$store.dispatch(
                      "audioSource/actionSetGainValueForLocal",
                      {
                        gainValue: gainValueLocal,
                        previewID,
                        channelID: 0,
                      }
                    );
                  });
                  // }
                }
                if (channelIndex == 3) {
                  channel.AdvancePan.forEach((pan, panIndex) => {
                    if (panIndex === 1) {
                      self.$set(channel.AdvancePan, panIndex, 100);
                    } else if (panIndex === 5) {
                      self.$set(channel.AdvancePan, panIndex, 100);
                    } else {
                      self.$set(channel.AdvancePan, panIndex, 0);
                    }
                  });
                  // if (
                  //   self.selectedPairValueForSource[source.Index - 1].pairValue == 2
                  // ) {
                  channel.Gain =
                    self.gainValue[self.selectedPairValue1ForSource]; // channel.Gain is used for webRTC audio only
                  channel.AdvanceGain.forEach((gain, gainIndex) => {
                    if (gainIndex === 1) {
                      self.$set(
                        channel.AdvanceGain,
                        gainIndex,
                        self.gainValue[self.selectedPairValue1ForSource]
                      );
                    } else if (gainIndex === 5) {
                      self.$set(channel.AdvanceGain, gainIndex, 238);
                    } else {
                      self.$set(channel.AdvanceGain, gainIndex, 0);
                    }
                    WebRtcClient.setChannelSources(self.previewId, 1, channel);
                    self.$store.dispatch(
                      "audioSource/actionSetGainValueForLocal",
                      {
                        gainValue: gainValueLocal,
                        previewID,
                        channelID: 1,
                      }
                    );
                  });
                  // }
                }
                if (channelIndex == 4 || channelIndex == 6) {
                  channel.AdvancePan.forEach((pan, panIndex) => {
                    if (panIndex === 6) {
                      self.$set(channel.AdvancePan, panIndex, 100);
                    } else {
                      self.$set(channel.AdvancePan, panIndex, 0);
                    }
                  });
                  // if (
                  //   self.selectedPairValueForSource[source.Index - 1].pairValue == 1
                  // ) {
                  channel.Gain =
                    self.gainValue[self.selectedPairValue1ForSource]; // channel.Gain is used for webRTC audio only
                  channel.AdvanceGain.forEach((gain, gainIndex) => {
                    if (gainIndex === 6) {
                      self.$set(channel.AdvanceGain, gainIndex, 238);
                    } else {
                      self.$set(channel.AdvanceGain, gainIndex, 0);
                    }
                  });
                  WebRtcClient.setChannelSources(self.previewId, 0, channel);
                  self.$store.dispatch(
                    "audioSource/actionSetGainValueForLocal",
                    {
                      gainValue: gainValueLocal,
                      previewID,
                      channelID: 0,
                    }
                  );
                  // }
                }
                if (channelIndex == 5 || channelIndex == 7) {
                  channel.AdvancePan.forEach((pan, panIndex) => {
                    if (panIndex === 7) {
                      self.$set(channel.AdvancePan, panIndex, 100);
                    } else {
                      self.$set(channel.AdvancePan, panIndex, 0);
                    }
                  });
                  // if (
                  //   self.selectedPairValueForSource[source.Index - 1].pairValue == 1
                  // ) {
                  channel.Gain =
                    self.gainValue[self.selectedPairValue1ForSource]; // channel.Gain is used for webRTC audio only
                  channel.AdvanceGain.forEach((gain, gainIndex) => {
                    if (gainIndex === 7) {
                      self.$set(channel.AdvanceGain, gainIndex, 238);
                    } else {
                      self.$set(channel.AdvanceGain, gainIndex, 0);
                    }
                  });
                  WebRtcClient.setChannelSources(self.previewId, 0, channel);
                  self.$store.dispatch(
                    "audioSource/actionSetGainValueForLocal",
                    {
                      gainValue: gainValueLocal,
                      previewID,
                      channelID: 0,
                    }
                  );
                  // }
                }

                // Pair 4 i.e channel 6 and 7, is not going to mix in any PGM Pair
                // so set 0 for all its channels in advanceGain
                if (channelIndex == 6) {
                  channel.Gain =
                    self.gainValue[self.selectedPairValue1ForSource]; // channel.Gain is used for webRTC audio only
                  channel.AdvanceGain.forEach((gain, gainIndex) => {
                    if (gainIndex === 6) {
                      self.$set(channel.AdvanceGain, gainIndex, 0);
                    }
                  });
                  WebRtcClient.setChannelSources(self.previewId, 0, channel);
                  self.$store.dispatch(
                    "audioSource/actionSetGainValueForLocal",
                    {
                      gainValue: gainValueLocal,
                      previewID,
                      channelID: 0,
                    }
                  );
                }
                if (channelIndex == 7) {
                  channel.Gain =
                    self.gainValue[self.selectedPairValue1ForSource]; // channel.Gain is used for webRTC audio only
                  channel.AdvanceGain.forEach((gain, gainIndex) => {
                    if (gainIndex === 7) {
                      self.$set(channel.AdvanceGain, gainIndex, 0);
                    }
                  });
                  WebRtcClient.setChannelSources(self.previewId, 0, channel);
                  self.$store.dispatch(
                    "audioSource/actionSetGainValueForLocal",
                    {
                      gainValue: gainValueLocal,
                      previewID,
                      channelID: 0,
                    }
                  );
                }
              });
            }
          }
          if (source.Index == 2 || source.Index == 3) {
            source.Channels.forEach((channel, channelIndex) => {
              let previewID = self.previewId;
              let gainValueLocal = self.gainValue;
              // channel.AdvanceGain = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
              if (channelIndex == 0) {
                // if (
                //   self.selectedPairValueForSource[source.Index - 1].pairValue ==
                //   1
                // ) {
                channel.Gain = self.gainValue[self.selectedPairValue1ForSource]; // channel.Gain is used for webRTC audio only
                channel.AdvanceGain.forEach((gain, gainIndex) => {
                  if (gainIndex === 0) {
                    self.$set(
                      channel.AdvanceGain,
                      gainIndex,
                      self.gainValue[self.selectedPairValue1ForSource]
                    );
                  } else {
                    self.$set(channel.AdvanceGain, gainIndex, 0);
                  }
                  WebRtcClient.setChannelSources(self.previewId, 0, channel);
                  self.$store.dispatch(
                    "audioSource/actionSetGainValueForLocal",
                    {
                      gainValue: gainValueLocal,
                      previewID,
                      channelID: 0,
                    }
                  );
                });
                // }
              }
              if (channelIndex == 1) {
                // if (
                //   self.selectedPairValueForSource[source.Index - 1].pairValue ==
                //   1
                // ) {
                channel.Gain = self.gainValue[self.selectedPairValue1ForSource]; // channel.Gain is used for webRTC audio only
                channel.AdvanceGain.forEach((gain, gainIndex) => {
                  if (gainIndex === 1) {
                    self.$set(
                      channel.AdvanceGain,
                      gainIndex,
                      self.gainValue[self.selectedPairValue1ForSource]
                    );
                  } else {
                    self.$set(channel.AdvanceGain, gainIndex, 0);
                  }
                  WebRtcClient.setChannelSources(self.previewId, 1, channel);
                  self.$store.dispatch(
                    "audioSource/actionSetGainValueForLocal",
                    {
                      gainValue: gainValueLocal,
                      previewID,
                      channelID: 1,
                    }
                  );
                });
                // }
              }
            });
          }
        }
      });
      // for (let property in this.audioSources) {
      //   if (property == "Sources") {
      //     this.audioSources.Sources.map((source) => {
      //       if (source.ID == self.sourceId) {
      //         source.Channels.map((channel, channelIndex) => {
      //           let previewID = self.previewId;
      //           let gainValue = self.gainValue;
      //           if (channelIndex == self.selectedPairValue1ForSource) {
      //             channel.Gain =
      //               self.gainValue[0];
      //             self.$store.dispatch(
      //               "audioSource/actionSetGainValueForLocal",
      //               {
      //                 gainValue,
      //                 previewID,
      //                 channelID: 0,
      //               }
      //             );
      //             WebRtcClient.setChannelSources(
      //               self.previewId,
      //               0,
      //               channel
      //             );
      //           }
      //           if (channelIndex == self.selectedPairValue2ForSource) {
      //             channel.Gain =
      //               self.gainValue[0];
      //             self.$store.dispatch(
      //               "audioSource/actionSetGainValueForLocal",
      //               {
      //                 gainValue,
      //                 previewID,
      //                 channelID: 1,
      //               }
      //             );
      //             WebRtcClient.setChannelSources(
      //               self.previewId,
      //               1,
      //               channel
      //             );
      //           }
      //         });
      //       }
      //     });
      //   }
      // }
      this.$store.dispatch(
        "audioSource/actionUpdateAudioSourcesByGainValue",
        this.audioSources
      );
      if (self.selectedPairValueForPGM == 1) {
        this.$store.dispatch(
          "audioSource/actionSetGainValue",
          this.audioSources
        );
      }
    }, 100),
  },
};
</script>
