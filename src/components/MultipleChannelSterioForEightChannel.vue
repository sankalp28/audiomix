<template>
  <div class="audio-mixer-box">
    <div class="channel-select">
      <el-select
        v-model="pairValue"
        placeholder="Select"
        @change="updateDataOnPairSelect"
        :disabled="isDisabled"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
    </div>
    <div>
      <component
        :is="dynamicComponent"
        v-bind="currentProperties"
        class="audio-mixer-repeat single-source eight-channel"
      ></component>
      <!-- <div
        class="dual-mono green"
        v-on="disableStereoButton ? null : { click: StereoDomoToggleBtn }"
      >
        Stereo
      </div> -->
    </div>
  </div>
</template>
<script>
import DualMonoChannel from "./DualMonoChannel.vue";
import StereoChannelForEightChannel from "./StereoChannelForEightChannel.vue";
import { WebRtcClient } from "../webRTC/localClient";
import { mapState } from "vuex";
export default {
  components: {
    StereoChannelForEightChannel,
    DualMonoChannel,
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
    balanceVal: {
      type: Number,
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
      isStereoDomoToggleBtn: true,
      options: [
        {
          value: 1,
          label: "Pair 1",
        },
        {
          value: 2,
          label: "Pair 2",
        },
        {
          value: 3,
          label: "Pair 3",
        },
        {
          value: 4,
          label: "Pair 4",
        },
      ],
      pairValue: 2,
      isDisabled: true,
    };
  },
  mounted() {
    this.initSourcePairSelection();
    WebRtcClient.getSelectedChannelPair(this.previewId, this.pairValue);
    this.$store.dispatch("audioSource/actionSetSelectedPairValueForSource", {
      previewId: this.previewId,
      pairValue: this.pairValue,
    });
  },
  computed: {
    ...mapState({
      audioGroups: (state) => state.audioSource.audioGroupData.response,
      audioSources: (state) => state.audioSource.audioSourceData.response,
      selectedPairValueForPGM: (state) =>
        state.audioSource.selectedPairValueForPGM,
    }),
    currentProperties() {
      return {
        channelsToRepeat: this.channelsToRepeat,
        gain: this.gain,
        sourceName: this.sourceName,
        sourceId: this.sourceId,
        previewId: this.previewId,
        balanceVal: this.balanceVal,
        pairSelected: this.pairSelected,
        sourceIndex: this.sourceIndex,
      };
    },
    dynamicComponent() {
      if (this.isStereoDomoToggleBtn) {
        return StereoChannelForEightChannel;
      } else {
        return DualMonoChannel;
      }
    },
    disableStereoButton() {
      let self = this;
      let stereoButtonState = false;
      // on mounted set channel sources for Groups
      this.audioGroups.Groups.map((element, index) => {
        element.ChannelIds.map((item) => {
          // find source id, channel index and preview id from sources which are added into either Groups
          let channelId = item.split("-");
          let sourceID = channelId[0];
          let selectedSource = self.audioSources.Sources.filter((item) => {
            return item.ID == sourceID;
          });
          let previewId = selectedSource[0].PreviewID;
          if (
            self.previewId == previewId &&
            self.audioGroups.Groups[index].isEnabled
          ) {
            stereoButtonState = true;
          }
        });
      });
      return stereoButtonState;
    },
  },
  watch: {
    selectedPairValueForPGM() {
      this.initSourcePairSelection();
      this.updateDataOnPairSelect();
    },
    pairValue(newPair) {
      let self = this;
      this.audioSources.Sources.map((source) => {
        if (source.PreviewID == self.previewId) {
          source.PairSelected = newPair;
          source.Channels.forEach((channel, channelIndex) => {
            switch (this.pairValue) {
              case 1:
                if (channelIndex == 0 || channelIndex == 1) {
                  if (channelIndex % 2 === 0) {
                    channel.AdvancePan.map((pan, panIndex) => {
                      if (panIndex === 0) {
                        self.$set(channel.AdvancePan, panIndex, 100);
                      }
                    });
                    channel.AdvanceGain.map((gain, gainIndex) => {
                      if (gainIndex === 0) {
                        self.$set(channel.AdvanceGain, gainIndex, 237);
                      }
                    });
                  } else {
                    channel.AdvancePan.map((pan, panIndex) => {
                      if (panIndex === 1) {
                        self.$set(channel.AdvancePan, panIndex, 100);
                      }
                    });
                    channel.AdvanceGain.map((gain, gainIndex) => {
                      if (gainIndex === 1) {
                        self.$set(channel.AdvanceGain, gainIndex, 237);
                      }
                    });
                  }
                } else if (channelIndex % 2 === 0) {
                  channel.AdvancePan.map((pan, panIndex) => {
                    if (panIndex === 0) {
                      self.$set(channel.AdvancePan, panIndex, 0);
                    }
                  });
                  channel.AdvanceGain.map((gain, gainIndex) => {
                    if (gainIndex === 0) {
                      self.$set(channel.AdvanceGain, gainIndex, 0);
                    }
                  });
                } else if (channelIndex % 2 !== 0) {
                  channel.AdvancePan.map((pan, panIndex) => {
                    if (panIndex === 1) {
                      self.$set(channel.AdvancePan, panIndex, 0);
                    }
                  });
                  channel.AdvanceGain.map((gain, gainIndex) => {
                    if (gainIndex === 1) {
                      self.$set(channel.AdvanceGain, gainIndex, 0);
                    }
                  });
                }
                break;
              case 2:
                if (channelIndex == 2 || channelIndex == 3) {
                  if (channelIndex % 2 === 0) {
                    channel.AdvancePan.map((pan, panIndex) => {
                      if (panIndex === 0) {
                        self.$set(channel.AdvancePan, panIndex, 100);
                      }
                    });
                    channel.AdvanceGain.map((gain, gainIndex) => {
                      if (gainIndex === 0) {
                        self.$set(channel.AdvanceGain, gainIndex, 237);
                      }
                    });
                  } else {
                    channel.AdvancePan.map((pan, panIndex) => {
                      if (panIndex === 1) {
                        self.$set(channel.AdvancePan, panIndex, 100);
                      }
                    });
                    channel.AdvanceGain.map((gain, gainIndex) => {
                      if (gainIndex === 1) {
                        self.$set(channel.AdvanceGain, gainIndex, 237);
                      }
                    });
                  }
                } else if (channelIndex % 2 === 0) {
                  channel.AdvancePan.map((pan, panIndex) => {
                    if (panIndex === 0) {
                      self.$set(channel.AdvancePan, panIndex, 0);
                    }
                  });
                  channel.AdvanceGain.map((gain, gainIndex) => {
                    if (gainIndex === 0) {
                      self.$set(channel.AdvanceGain, gainIndex, 0);
                    }
                  });
                } else if (channelIndex % 2 !== 0) {
                  channel.AdvancePan.map((pan, panIndex) => {
                    if (panIndex === 1) {
                      self.$set(channel.AdvancePan, panIndex, 0);
                    }
                  });
                  channel.AdvanceGain.map((gain, gainIndex) => {
                    if (gainIndex === 1) {
                      self.$set(channel.AdvanceGain, gainIndex, 0);
                    }
                  });
                }
                break;
              case 3:
                if (channelIndex == 4 || channelIndex == 5) {
                  if (channelIndex % 2 === 0) {
                    channel.AdvancePan.map((pan, panIndex) => {
                      if (panIndex === 0) {
                        self.$set(channel.AdvancePan, panIndex, 100);
                      }
                    });
                    channel.AdvanceGain.map((gain, gainIndex) => {
                      if (gainIndex === 0) {
                        self.$set(channel.AdvanceGain, gainIndex, 237);
                      }
                    });
                  } else {
                    channel.AdvancePan.map((pan, panIndex) => {
                      if (panIndex === 1) {
                        self.$set(channel.AdvancePan, panIndex, 100);
                      }
                    });
                    channel.AdvanceGain.map((gain, gainIndex) => {
                      if (gainIndex === 1) {
                        self.$set(channel.AdvanceGain, gainIndex, 237);
                      }
                    });
                  }
                } else if (channelIndex % 2 === 0) {
                  channel.AdvancePan.map((pan, panIndex) => {
                    if (panIndex === 0) {
                      self.$set(channel.AdvancePan, panIndex, 0);
                    }
                  });
                  channel.AdvanceGain.map((gain, gainIndex) => {
                    if (gainIndex === 0) {
                      self.$set(channel.AdvanceGain, gainIndex, 0);
                    }
                  });
                } else if (channelIndex % 2 !== 0) {
                  channel.AdvancePan.map((pan, panIndex) => {
                    if (panIndex === 1) {
                      self.$set(channel.AdvancePan, panIndex, 0);
                    }
                  });
                  channel.AdvanceGain.map((gain, gainIndex) => {
                    if (gainIndex === 1) {
                      self.$set(channel.AdvanceGain, gainIndex, 0);
                    }
                  });
                }
                break;
              case 4:
                if (channelIndex == 6 || channelIndex == 7) {
                  if (channelIndex % 2 === 0) {
                    channel.AdvancePan.map((pan, panIndex) => {
                      if (panIndex === 0) {
                        self.$set(channel.AdvancePan, panIndex, 100);
                      }
                    });
                    channel.AdvanceGain.map((gain, gainIndex) => {
                      if (gainIndex === 0) {
                        self.$set(channel.AdvanceGain, gainIndex, 237);
                      }
                    });
                  } else {
                    channel.AdvancePan.map((pan, panIndex) => {
                      if (panIndex === 1) {
                        self.$set(channel.AdvancePan, panIndex, 100);
                      }
                    });
                    channel.AdvanceGain.map((gain, gainIndex) => {
                      if (gainIndex === 1) {
                        self.$set(channel.AdvanceGain, gainIndex, 237);
                      }
                    });
                  }
                } else if (channelIndex % 2 === 0) {
                  channel.AdvancePan.map((pan, panIndex) => {
                    if (panIndex === 0) {
                      self.$set(channel.AdvancePan, panIndex, 0);
                    }
                  });
                  channel.AdvanceGain.map((gain, gainIndex) => {
                    if (gainIndex === 0) {
                      self.$set(channel.AdvanceGain, gainIndex, 0);
                    }
                  });
                } else if (channelIndex % 2 !== 0) {
                  channel.AdvancePan.map((pan, panIndex) => {
                    if (panIndex === 1) {
                      self.$set(channel.AdvancePan, panIndex, 0);
                    }
                  });
                  channel.AdvanceGain.map((gain, gainIndex) => {
                    if (gainIndex === 1) {
                      self.$set(channel.AdvanceGain, gainIndex, 0);
                    }
                  });
                }
                break;

              default:
                break;
            }
          });
        }
      });
      if (self.selectedPairValueForPGM === 1) {
        this.$store.dispatch(
          "audioSource/actionSetGainValue",
          this.audioSources
        );
      }

      this.$store.dispatch("audioSource/actionSetIsSourcePairChanged", true);
    },
  },
  methods: {
    initSourcePairSelection() {
      let self = this;
      this.audioSources.Sources.map((item) => {
        if (item.PreviewID == self.previewId) {
          self.pairValue = item.PairSelected;
        }
      });
      if (self.selectedPairValueForPGM == 1) {
        if (self.sourceIndex == 1) {
          // self.pairValue = 2;
          self.isDisabled = false;
        }
        // if (self.sourceIndex == 2 || self.sourceIndex == 3) {
        //   self.isDisabled = true;
        // }
      } else if (self.selectedPairValueForPGM == 2) {
        if (self.sourceIndex == 1) {
          self.pairValue = 1;
          self.isDisabled = true;
        }
      } else if (self.selectedPairValueForPGM == 3) {
        if (self.sourceIndex == 1) {
          self.pairValue = 2;
          self.isDisabled = true;
        }
      } else if (self.selectedPairValueForPGM == 4) {
        if (self.sourceIndex == 1) {
          self.pairValue = 3;
          self.isDisabled = true;
        }
      }
    },
    updateDataOnPairSelect() {
      this.$store.dispatch("audioSource/actionSetSelectedPairValueForSource", {
        previewId: this.previewId,
        pairValue: this.pairValue,
      });
      WebRtcClient.getSelectedChannelPair(this.previewId, this.pairValue, true);
      // let self = this;
      // let selectedPairValue1ForSource = 0;
      // let selectedPairValue2ForSource = 1;
      // switch (this.pairValue) {
      //   case 1:
      //     selectedPairValue1ForSource = 0;
      //     selectedPairValue2ForSource = 1;
      //     break;
      //   case 2:
      //     selectedPairValue1ForSource = 2;
      //     selectedPairValue2ForSource = 3;
      //     break;
      //   case 3:
      //     selectedPairValue1ForSource = 4;
      //     selectedPairValue2ForSource = 5;
      //     break;
      //   case 4:
      //     selectedPairValue1ForSource = 6;
      //     selectedPairValue2ForSource = 7;
      //     break;
      //   default:
      //     break;
      // }
      // this.audioSources.Sources.map((item) => {
      //   if (item.PreviewID == self.previewId) {
      //     item.PairSelected = this.pairValue;
      //     item.Channels.forEach((element, index) => {
      //       if (index == selectedPairValue1ForSource) {
      //         if (self.selectedPairValueForPGM == 1) {
      //           element.AdvancePan.forEach((panValue, index) => {
      //             if (index === 0) {
      //               self.$set(element.AdvancePan, index, 100);
      //             } else {
      //               self.$set(element.AdvancePan, index, 0);
      //             }
      //           });
      //           // element.AdvanceGain.forEach((panValue, index) => {
      //           //   if (index === 0) {
      //           //     self.$set(element.AdvanceGain, index, 100);
      //           //   } else {
      //           //     self.$set(element.AdvanceGain, index, 0);
      //           //   }
      //           // });
      //         } else if (self.selectedPairValueForPGM == 2) {
      //           element.AdvancePan.forEach((panValue, index) => {
      //             if (index === 2) {
      //               self.$set(element.AdvancePan, index, 100);
      //             } else {
      //               self.$set(element.AdvancePan, index, 0);
      //             }
      //           });
      //         } else if (self.selectedPairValueForPGM == 3) {
      //           element.AdvancePan.forEach((panValue, index) => {
      //             if (index === 4) {
      //               self.$set(element.AdvancePan, index, 100);
      //             } else {
      //               self.$set(element.AdvancePan, index, 0);
      //             }
      //           });
      //         } else if (self.selectedPairValueForPGM == 4) {
      //           element.AdvancePan.forEach((panValue, index) => {
      //             // if PGM Pair 4 is selected, send Input Pair 3 and 4 both
      //             if (index === 4 || index === 6) {
      //               self.$set(element.AdvancePan, index, 100);
      //             } else {
      //               self.$set(element.AdvancePan, index, 0);
      //             }
      //           });
      //         }
      //       }
      //       if (index == selectedPairValue2ForSource) {
      //         if (self.selectedPairValueForPGM == 1) {
      //           element.AdvancePan.forEach((panValue, index) => {
      //             if (index === 1) {
      //               self.$set(element.AdvancePan, index, 100);
      //             } else {
      //               self.$set(element.AdvancePan, index, 0);
      //             }
      //           });
      //           // element.AdvanceGain.forEach((panValue, index) => {
      //           //   if (index === 1) {
      //           //     self.$set(element.AdvanceGain, index, 100);
      //           //   } else {
      //           //     self.$set(element.AdvanceGain, index, 0);
      //           //   }
      //           // });
      //         } else if (self.selectedPairValueForPGM == 2) {
      //           element.AdvancePan.forEach((panValue, index) => {
      //             if (index === 3) {
      //               self.$set(element.AdvancePan, index, 100);
      //             } else {
      //               self.$set(element.AdvancePan, index, 0);
      //             }
      //           });
      //         } else if (self.selectedPairValueForPGM == 3) {
      //           element.AdvancePan.forEach((panValue, index) => {
      //             if (index === 5) {
      //               self.$set(element.AdvancePan, index, 100);
      //             } else {
      //               self.$set(element.AdvancePan, index, 0);
      //             }
      //           });
      //         } else if (self.selectedPairValueForPGM == 4) {
      //           element.AdvancePan.forEach((panValue, index) => {
      //             // if PGM Pair 4 is selected, send Input Pair 3 and 4 both
      //             if (index === 5 || index === 7) {
      //               self.$set(element.AdvancePan, index, 100);
      //             } else {
      //               self.$set(element.AdvancePan, index, 0);
      //             }
      //           });
      //         }
      //       }
      //     });
      //   }
      // });
      // window.console.log("data sent --> ", this.audioSources);
      // this.$store.dispatch("audioSource/actionSetGainValue", this.audioSources);
    },
    StereoDomoToggleBtn() {
      let self = this;
      this.isStereoDomoToggleBtn = !this.isStereoDomoToggleBtn;
      for (let property in this.audioSources) {
        if (property == "Sources") {
          this.audioSources.Sources.map((item) => {
            if (item.PreviewID == this.previewId) {
              item.Balance = -1;
              // reset Pan value for API, when user switches between dual-mono to stereo and vice-versa
              item.Channels.forEach((element, index) => {
                if (index == 0) {
                  element.Pan = 0;
                } else {
                  element.Pan = 100;
                }
              });
            }
          });
        }
      }
      this.audioGroups.Groups.map((element, index) => {
        element.ChannelIds.map((item) => {
          // find source id, channel index and preview id from sources which are added into either Groups
          let channelId = item.split("-");
          let sourceID = channelId[0];
          let channelIndex = channelId[1];
          let selectedSource = self.audioSources.Sources.filter((item) => {
            return item.ID == sourceID;
          });
          let previewId = selectedSource[0].PreviewID;
          if (self.previewId == previewId && channelIndex == 0 && index == 0) {
            this.$store.dispatch(
              "audioSource/actionSetSelectedSourceInGroup1",
              `${sourceID}-1`
            );
          }
          if (self.previewId == previewId && channelIndex == 1 && index == 0) {
            this.$store.dispatch(
              "audioSource/actionSetSelectedSourceInGroup1",
              `${sourceID}-0`
            );
          }
          if (self.previewId == previewId && channelIndex == 0 && index == 1) {
            this.$store.dispatch(
              "audioSource/actionSetSelectedSourceInGroup2",
              `${sourceID}-1`
            );
          }
          if (self.previewId == previewId && channelIndex == 1 && index == 1) {
            this.$store.dispatch(
              "audioSource/actionSetSelectedSourceInGroup2",
              `${sourceID}-0`
            );
          }
        });
      });
      this.$store.dispatch("audioSource/actionSetGainValue", this.audioSources);

      // reset Pan for webRTC, when user switches between dual-mono to stereo and vice-versa
      WebRtcClient.changePan(this.previewId, -1, 0);
      WebRtcClient.changePan(this.previewId, 1, 1);
    },
  },
};
</script>