<template>
  <div class="audio-mixer">
    <p>{{ this.mixerName }}</p>
    <div class="audio-mixer-box">
      <Headphone
        :previewId="previewId"
        :master="master"
        :isMute="!isActiveMute"
      />
      <div class="slider">
        <div class="range-slide">
          <div class="range-box">
            <div class="slider-vert">
              <div class="slider-large">
                <el-slider
                  v-if="advanceMix"
                  v-model="gainValueForPGMPair"
                  vertical
                  :show-tooltip="false"
                  height="440px"
                  :marks="marks"
                  :max="299"
                  :min="0"
                  @input="
                    handleGaincrementValuehangeLocal();
                    handleGaincrementValuehange();
                  "
                ></el-slider>
                <el-slider
                  v-else
                  v-model="gainValue"
                  vertical
                  :show-tooltip="false"
                  height="440px"
                  :marks="marks"
                  :max="299"
                  :min="0"
                  @input="
                    handleGaincrementValuehangeLocal();
                    handleGaincrementValuehange();
                  "
                ></el-slider>
              </div>
              <div class="slider-large2">
                <vu-meter
                  :val="gainVal0"
                  :height="440"
                  :width="4"
                  :previewId="previewId"
                  :newVolumePercentage="newVolume0"
                ></vu-meter>
                <vu-meter
                  style="margin-left='2px'"
                  :val="gainVal1"
                  :height="440"
                  :width="4"
                  :previewId="previewId"
                  :newVolumePercentage="newVolume1"
                ></vu-meter>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="btn-sec">
        <div class="muteIcon" v-if="advanceMix">
          <span
            v-if="!isActiveMutePair"
            class="icon iconfont"
            @click="toggleMute"
            >&#xe61d;</span
          >
          <span v-else class="icon iconfont disabled" @click="toggleMute"
            >&#xe69d;</span
          >
        </div>
        <div class="muteIcon" v-else>
          <span v-if="!isActiveMute" class="icon iconfont" @click="toggleMute"
            >&#xe61d;</span
          >
          <span v-else class="icon iconfont disabled" @click="toggleMute"
            >&#xe69d;</span
          >
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import VuMeter from "./VuMeter.vue";
import Headphone from "./Headphone.vue";
import { mapState, mapGetters } from "vuex";
import { WebRtcClient } from "../webRTC/localClient";
import _ from "lodash";
import common from "../mixins/common";
export default {
  mixins: [common],
  components: {
    "vu-meter": VuMeter,
    Headphone,
  },
  props: {
    mixerName: {
      type: String,
    },
    previewId: {
      type: String,
    },
    gain: {
      type: Number,
    },
    advanceGainPair1: {
      type: Number,
    },
    advanceGainPair2: {
      type: Number,
    },
    advanceGainPair3: {
      type: Number,
    },
    advanceGainPair4: {
      type: Number,
    },
    isMute: {
      type: Boolean,
    },
    isMutePair1: {
      type: Boolean,
    },
    isMutePair2: {
      type: Boolean,
    },
    isMutePair3: {
      type: Boolean,
    },
    isMutePair4: {
      type: Boolean,
    },
    master: {
      type: Boolean,
    },
  },
  data() {
    return {
      gainValue: this.gain,
      gainValueForPair1: this.advanceGainPair1,
      gainValueForPair2: this.advanceGainPair2,
      gainValueForPair3: this.advanceGainPair3,
      gainValueForPair4: this.advanceGainPair4,
      gainValueForPGMPair: this.advanceGainPair1,
      faderValue: 0,
      isActiveMute: this.isMute,
      isActiveMutePair: this.isMutePair1,
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
      localUnmuteData: [],
    };
  },
  computed: {
    ...mapGetters({ audioSources: "audioSource/channelList" }),
    ...mapState({
      volume: (state) => state.audioSource.volume,
      localUnmute: (state) => state.audioSource.localUnmute,
      outputArray: (state) => state.audioSource.outputArray,
      advanceMix: (state) => state.audioSource.advanceMix,
      selectedPairValueForPGM: (state) =>
        state.audioSource.selectedPairValueForPGM,
    }),
  },
  watch: {
    selectedPairValueForPGM() {
      switch (this.selectedPairValueForPGM) {
        case 1:
          this.gainValueForPGMPair = this.advanceGainPair1;
          this.isActiveMutePair = this.isMutePair1;
          WebRtcClient.setChannelSources(
            this.previewId,
            0,
            this.audioSources.Master.Channels[0]
          );
          WebRtcClient.setChannelSources(
            this.previewId,
            1,
            this.audioSources.Master.Channels[1]
          );
          break;
        case 2:
          this.gainValueForPGMPair = this.advanceGainPair2;
          this.isActiveMutePair = this.isMutePair2;
          WebRtcClient.setChannelSources(
            this.previewId,
            2,
            this.audioSources.Master.Channels[2]
          );
          WebRtcClient.setChannelSources(
            this.previewId,
            3,
            this.audioSources.Master.Channels[3]
          );
          break;
        case 3:
          this.gainValueForPGMPair = this.advanceGainPair3;
          this.isActiveMutePair = this.isMutePair3;
          WebRtcClient.setChannelSources(
            this.previewId,
            4,
            this.audioSources.Master.Channels[4]
          );
          WebRtcClient.setChannelSources(
            this.previewId,
            5,
            this.audioSources.Master.Channels[5]
          );
          break;
        case 4:
          this.gainValueForPGMPair = this.advanceGainPair4;
          this.isActiveMutePair = this.isMutePair4;
          WebRtcClient.setChannelSources(
            this.previewId,
            6,
            this.audioSources.Master.Channels[6]
          );
          WebRtcClient.setChannelSources(
            this.previewId,
            7,
            this.audioSources.Master.Channels[7]
          );
          break;
        default:
          break;
      }
      this.outputArray.forEach((element) => {
        WebRtcClient.changeGainLeft(element.previewID);
        WebRtcClient.changeGainRight(element.previewID);
      });
    },
    localUnmute() {
      this.localUnmuteData = this.localUnmute;
    },
    volume() {
      if (this.previewId === this.volume.previewId) {
        this.gainVal0 = this.volume.value[0];
        this.gainVal1 = this.volume.value[1];
        this.newVolume0 = this.volume.newVolumeValue[0];
        this.newVolume1 = this.volume.newVolumeValue[1];
      }
    },
  },
  methods: {
    handleGaincrementValuehangeLocal() {
      const self = this;
      this.outputArray.forEach((element) => {
        if (self.advanceMix) {
          switch (self.selectedPairValueForPGM) {
            case 1:
              self.audioSources.Master.Channels[0].AdvanceGain[0] = this.gainValueForPGMPair;
              self.audioSources.Master.Channels[0].Gain = this.gainValueForPGMPair;
              WebRtcClient.setChannelSources(
                self.previewId,
                0,
                self.audioSources.Master.Channels[0]
              );
              WebRtcClient.changeGainLeft(element.previewID, null, 0, true);
              WebRtcClient.changeGainRight(element.previewID, null, 0, true);
              break;
            case 2:
              self.audioSources.Master.Channels[2].AdvanceGain[2] = this.gainValueForPGMPair;
              self.audioSources.Master.Channels[2].Gain = this.gainValueForPGMPair;
              WebRtcClient.setChannelSources(
                self.previewId,
                0,
                self.audioSources.Master.Channels[2]
              );
              WebRtcClient.changeGainLeft(element.previewID, null, 2, true);
              WebRtcClient.changeGainRight(element.previewID, null, 2, true);
              break;
            case 3:
              self.audioSources.Master.Channels[4].AdvanceGain[4] = this.gainValueForPGMPair;
              self.audioSources.Master.Channels[4].Gain = this.gainValueForPGMPair;
              WebRtcClient.setChannelSources(
                self.previewId,
                0,
                self.audioSources.Master.Channels[4]
              );
              WebRtcClient.changeGainLeft(element.previewID, null, 4, true);
              WebRtcClient.changeGainRight(element.previewID, null, 4, true);
              break;
            case 4:
              self.audioSources.Master.Channels[6].AdvanceGain[6] = this.gainValueForPGMPair;
              self.audioSources.Master.Channels[6].Gain = this.gainValueForPGMPair;
              WebRtcClient.setChannelSources(
                self.previewId,
                0,
                self.audioSources.Master.Channels[6]
              );
              WebRtcClient.changeGainLeft(element.previewID, null, 6, true);
              WebRtcClient.changeGainRight(element.previewID, null, 6, true);
              break;
            default:
              break;
          }
        } else {
          // TODO isMute is not added to master, so added this. Need to refactor
          this.audioSources.Master.Channels[0].Gain = this.gainValue;
          WebRtcClient.setChannelSources(
            this.previewId,
            0,
            this.audioSources.Master.Channels[0]
          );
          WebRtcClient.changeGainLeft(element.previewID);
          WebRtcClient.changeGainRight(element.previewID);
        }
        for (let property in this.audioSources) {
          if (property == "Master") {
            if (this.advanceMix) {
              let pgmPair1 = [],
                pgmPair2 = [],
                pgmPair3 = [],
                pgmPair4 = [];
              let self = this;

              switch (self.selectedPairValueForPGM) {
                case 1:
                  pgmPair1.push(0, 1);
                  pgmPair1.forEach(function (pgmPair) {
                    self.audioSources.Master.Channels.forEach(function (
                      element,
                      index
                    ) {
                      if (index == pgmPair) {
                        element.Gain = self.gainValueForPGMPair; // not needed for BE, added to match Voume meter on UI only
                        element.AdvanceGain.forEach(function (item, idx) {
                          if (idx == pgmPair) {
                            self.$set(
                              element.AdvanceGain,
                              idx,
                              self.gainValueForPGMPair
                            );
                          } else {
                            self.$set(element.AdvanceGain, idx, 0);
                          }
                        });
                      }
                    });
                  });
                  break;
                case 2:
                  pgmPair2.push(2, 3);
                  pgmPair2.forEach(function (pgmPair) {
                    self.audioSources.Master.Channels.forEach(function (
                      element,
                      index
                    ) {
                      if (index == pgmPair) {
                        element.Gain = self.gainValueForPGMPair; // not needed for BE, added to match Voume meter on UI only
                        element.AdvanceGain.forEach(function (item, idx) {
                          if (idx == pgmPair) {
                            self.$set(
                              element.AdvanceGain,
                              idx,
                              self.gainValueForPGMPair
                            );
                          } else {
                            self.$set(element.AdvanceGain, idx, 0);
                          }
                        });
                      }
                    });
                  });
                  break;
                case 3:
                  pgmPair3.push(4, 5);
                  pgmPair3.forEach(function (pgmPair) {
                    self.audioSources.Master.Channels.forEach(function (
                      element,
                      index
                    ) {
                      if (index == pgmPair) {
                        element.Gain = self.gainValueForPGMPair; // not needed for BE, added to match Voume meter on UI only
                        element.AdvanceGain.forEach(function (item, idx) {
                          if (idx == pgmPair) {
                            self.$set(
                              element.AdvanceGain,
                              idx,
                              self.gainValueForPGMPair
                            );
                          } else {
                            self.$set(element.AdvanceGain, idx, 0);
                          }
                        });
                      }
                    });
                  });
                  break;
                case 4:
                  pgmPair4.push(6, 7);
                  pgmPair4.forEach(function (pgmPair) {
                    self.audioSources.Master.Channels.forEach(function (
                      element,
                      index
                    ) {
                      if (index == pgmPair) {
                        element.Gain = self.gainValueForPGMPair; // not needed for BE, added to match Voume meter on UI only
                        element.AdvanceGain.forEach(function (item, idx) {
                          if (idx == pgmPair) {
                            self.$set(
                              element.AdvanceGain,
                              idx,
                              self.gainValueForPGMPair
                            );
                          } else {
                            self.$set(element.AdvanceGain, idx, 0);
                          }
                          let gainValueForPGMPair = [
                            self.gainValueForPGMPair,
                            self.gainValueForPGMPair,
                          ];
                          let previewID = self.previewId;
                          self.$store.dispatch(
                            "audioSource/actionSetGainValueForLocal",
                            {
                              gainValueForPGMPair,
                              previewID,
                            }
                          );
                        });
                      }
                    });
                  });
                  break;
                default:
                  break;
              }
            } else {
              this.audioSources.Master.Channels[0].Gain = self.gainValue;
              let gainValue = [this.gainValue, this.gainValue];
              let previewID = self.previewId;
              self.$store.dispatch("audioSource/actionSetGainValueForLocal", {
                gainValue,
                previewID,
              });
            }
          }
        }
      });
    },
    handleGaincrementValuehange: _.throttle(function () {
      for (let property in this.audioSources) {
        if (property == "Master") {
          if (this.advanceMix) {
            let pgmPair1 = [],
              pgmPair2 = [],
              pgmPair3 = [],
              pgmPair4 = [];
            let self = this;

            switch (self.selectedPairValueForPGM) {
              case 1:
                pgmPair1.push(0, 1);
                pgmPair1.forEach(function (pgmPair) {
                  self.audioSources.Master.Channels.forEach(function (
                    element,
                    index
                  ) {
                    if (index == pgmPair) {
                      element.AdvanceGain.forEach(function (item, idx) {
                        if (idx == pgmPair) {
                          self.$set(
                            element.AdvanceGain,
                            idx,
                            self.gainValueForPGMPair
                          );
                        } else {
                          self.$set(element.AdvanceGain, idx, 0);
                        }
                      });
                    }
                  });
                });
                break;
              case 2:
                pgmPair2.push(2, 3);
                pgmPair2.forEach(function (pgmPair) {
                  self.audioSources.Master.Channels.forEach(function (
                    element,
                    index
                  ) {
                    if (index == pgmPair) {
                      element.AdvanceGain.forEach(function (item, idx) {
                        if (idx == pgmPair) {
                          self.$set(
                            element.AdvanceGain,
                            idx,
                            self.gainValueForPGMPair
                          );
                        } else {
                          self.$set(element.AdvanceGain, idx, 0);
                        }
                      });
                    }
                  });
                });
                break;
              case 3:
                pgmPair3.push(4, 5);
                pgmPair3.forEach(function (pgmPair) {
                  self.audioSources.Master.Channels.forEach(function (
                    element,
                    index
                  ) {
                    if (index == pgmPair) {
                      element.AdvanceGain.forEach(function (item, idx) {
                        if (idx == pgmPair) {
                          self.$set(
                            element.AdvanceGain,
                            idx,
                            self.gainValueForPGMPair
                          );
                        } else {
                          self.$set(element.AdvanceGain, idx, 0);
                        }
                      });
                    }
                  });
                });
                break;
              case 4:
                pgmPair4.push(6, 7);
                pgmPair4.forEach(function (pgmPair) {
                  self.audioSources.Master.Channels.forEach(function (
                    element,
                    index
                  ) {
                    if (index == pgmPair) {
                      element.AdvanceGain.forEach(function (item, idx) {
                        if (idx == pgmPair) {
                          self.$set(
                            element.AdvanceGain,
                            idx,
                            self.gainValueForPGMPair
                          );
                        } else {
                          self.$set(element.AdvanceGain, idx, 0);
                        }
                      });
                    }
                  });
                });
                break;
              default:
                break;
            }
          } else {
            this.audioSources.Master.Channels[0].Gain = this.gainValue;
            this.audioSources.Master.Channels[1].Gain = this.gainValue;
          }
        }
      }
      this.$store.dispatch("audioSource/actionSetGainValue", this.audioSources);
    }, 100),
    toggleMute() {
      let self = this;
      for (let property1 in this.audioSources) {
        if (property1 == "Master") {
          this.isActiveMutePair = !this.isActiveMutePair;
          if (this.advanceMix) {
            let pgmPair1 = [],
              pgmPair2 = [],
              pgmPair3 = [],
              pgmPair4 = [];

            switch (this.selectedPairValueForPGM) {
              case 1:
                pgmPair1.push(0, 1);
                pgmPair1.forEach(function (pgmPair) {
                  self.audioSources.Master.Channels.forEach(function (
                    element,
                    index
                  ) {
                    if (index == pgmPair) {
                      element.isMute = self.isActiveMutePair;
                      WebRtcClient.setChannelSources(
                        self.previewId,
                        index,
                        element
                      );
                    }
                  });
                });
                break;
              case 2:
                pgmPair2.push(2, 3);
                pgmPair2.forEach(function (pgmPair) {
                  self.audioSources.Master.Channels.forEach(function (
                    element,
                    index
                  ) {
                    if (index == pgmPair) {
                      element.isMute = self.isActiveMutePair;
                      WebRtcClient.setChannelSources(
                        self.previewId,
                        index,
                        element
                      );
                    }
                  });
                });
                break;
              case 3:
                pgmPair3.push(4, 5);
                pgmPair3.forEach(function (pgmPair) {
                  self.audioSources.Master.Channels.forEach(function (
                    element,
                    index
                  ) {
                    if (index == pgmPair) {
                      element.isMute = self.isActiveMutePair;
                      WebRtcClient.setChannelSources(
                        self.previewId,
                        index,
                        element
                      );
                    }
                  });
                });
                break;
              case 4:
                pgmPair4.push(6, 7);
                pgmPair4.forEach(function (pgmPair) {
                  self.audioSources.Master.Channels.forEach(function (
                    element,
                    index
                  ) {
                    if (index == pgmPair) {
                      element.isMute = self.isActiveMutePair;
                      WebRtcClient.setChannelSources(
                        self.previewId,
                        index,
                        element
                      );
                    }
                  });
                });
                break;
              default:
                break;
            }
            this.setSourcesInApiWithoutCommit(this.audioSources);
            this.outputArray.forEach((element) => {
              WebRtcClient.changeGainLeft(element.previewID);
              WebRtcClient.changeGainRight(element.previewID);
            });
          } else {
            this.isActiveMute = !this.isActiveMute;
            this.audioSources.Master.Channels.map((item, index) => {
              item.isMute = self.isActiveMute ? true : false;
              WebRtcClient.setChannelSources(self.previewId, index, item);
            });
            this.setSourcesInApiWithoutCommit(this.audioSources);
            this.outputArray.forEach((element) => {
              WebRtcClient.changeGainLeft(element.previewID);
              WebRtcClient.changeGainRight(element.previewID);
            });
          }
        }
      }
    },
  },
};
</script>