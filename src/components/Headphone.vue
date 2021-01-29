<template>
  <div class="headfone">
    <span
      v-if="groupNumber !== 1 && groupNumber !== 2"
      :class="['icon iconfont', isActive ? '' : 'disabled']"
      @click="toggleHeadphone"
      :ref="master ? 'headphoneMaster' : null"
      >&#xe66f;</span
    >
    <span
      v-else-if="groupNumber == 1"
      :class="[
        'icon iconfont',
        this.audioGroups.Groups[0].ChannelIds.length &&
        isActive &&
        !this.afvEnabled()
          ? ''
          : 'disabled',
      ]"
      v-on="
        this.audioGroups.Groups[0].ChannelIds.length &&
        this.isGroup1Enabled() &&
        !this.afvEnabled()
          ? { click: toggleHeadphone }
          : null
      "
      ref="headphoneGroup1"
      >&#xe66f;</span
    >
    <span
      v-else-if="groupNumber == 2"
      :class="[
        'icon iconfont',
        this.audioGroups.Groups[1].ChannelIds.length &&
        isActive &&
        !this.afvEnabled()
          ? ''
          : 'disabled',
      ]"
      v-on="
        this.audioGroups.Groups[1].ChannelIds.length &&
        this.isGroup2Enabled() &&
        !this.afvEnabled()
          ? { click: toggleHeadphone }
          : null
      "
      ref="headphoneGroup2"
      >&#xe66f;</span
    >
    <!-- applied to hidden button to apply volume meter on page load -->
    <button
      style="display: none"
      ref="headphone"
      @click="initialHeadPhoneSettings"
    >
      Dummy
    </button>
  </div>
</template>
<script>
import { WebRtcClient } from "../webRTC/localClient";
import { mapGetters, mapState } from "vuex";
export default {
  props: {
    previewId: {
      type: String,
    },
    sourceId: {
      type: String,
    },
    channelIndex: {
      type: Number,
    },
    groupNumber: {
      type: Number,
    },
    master: {
      type: Boolean,
    },
    isMute: {
      type: Boolean,
    },
    balance: {
      type: Number,
    },
  },
  data() {
    return {
      isActive: false,
      watchCounter: 1,
      resumedIds: [],
      // isGroup1Enabled: false,
      // isGroup2Enabled: false,
    };
  },
  mounted() {
    if (this.audioSourcesForHeadphoneOnly.Sources !== undefined) {
      let self = this;
      this.audioSourcesForHeadphoneOnly.Sources.forEach((element) => {
        if (self.previewId == element.PreviewID) {
          element.Channels.forEach((item) => {
            self.isActive = item.HeadPhone ? true : false;
          });
        }
      });
    }
    // this.isGroup1Enabled = this.audioGroups.Groups[0].isEnabled;
    // this.isGroup2Enabled = this.audioGroups.Groups[1].isEnabled;
  },
  computed: {
    ...mapGetters({
      channelList: "audioSource/channelList",
      dataForGroup1: "audioGroup/getDataForGroup1",
      dataForGroup2: "audioGroup/getDataForGroup2",
    }),
    ...mapState({
      videoPlayed: (state) => state.audioSource.videoPlayed,
      outputArray: (state) => state.audioSource.outputArray,
      audioSources: (state) => state.audioSource.audioSourceData.response,
      audioGroups: (state) => state.audioSource.audioGroupData.response,
      audioSourcesForHeadphoneOnly: (state) => state.audioSource.audioSources,
      afvState: (state) => state.audioSource.afvState,
      advanceMix: (state) => state.audioSource.advanceMix,
    }),
  },
  watch: {
    afvState() {
      if (this.afvState) {
        this.audioGroups.Groups[0].HeadPhone = false;
        this.audioGroups.Groups[1].HeadPhone = false;
      } else {
        if (this.groupNumber == 1 || this.groupNumber == 2) {
          this.isActive = false;
        }
      }
    },
    // applied to hidden button to apply volume meter on page load
    videoPlayed() {
      let self = this;
      if (
        this.videoPlayed.status &&
        this.videoPlayed.previewId == this.previewId
      ) {
        this.$refs.headphone.click();

        // enable master headphone on page load as soon as videos played
        setTimeout(() => {
          if (self.watchCounter == 1) {
            // if (self.master) {
            self.$refs.headphoneMaster.click();
            self.watchCounter = 0;
            // }
          }
        }, 500);
      }
    },
    // audioGroups() {
    //   console.log("watched !!");
    //   this.isGroup1Enabled = this.audioGroups.Groups[0].isEnabled;
    //   this.isGroup2Enabled = this.audioGroups.Groups[1].isEnabled;
    // },
  },
  methods: {
    afvEnabled() {
      return this.audioSources.AFV;
    },
    isGroup1Enabled() {
      return this.audioGroups.Groups[0].isEnabled;
    },
    isGroup2Enabled() {
      return this.audioGroups.Groups[1].isEnabled;
    },
    // applied to hidden button to apply volume meter on page load
    initialHeadPhoneSettings() {
      // check if source audio is not resumed already, then only resume and mute it, so that there will be no sound on page load
      if (!this.resumedIds.includes(this.previewId)) {
        if (this.previewId !== undefined && !this.master) {
          this.resumedIds.push(this.previewId);
          WebRtcClient.resumeAudio(this.previewId);
        }
      }
    },
    toggleHeadphone() {
      this.isActive = !this.isActive;

      let localMuteData = {
        isLocalMute: false,
        channelIndex: null,
        previewId: null,
      };
      // var derivedSourceId = null;
      // var channelId = null;
      var self = this;
      // var previewId = null;
      for (let property in this.audioSources) {
        if (property == "Sources" && !this.master) {
          this.audioSources.Sources.map((item) => {
            let balance = item.Balance;
            if (item.ID == self.sourceId) {
              item.Channels.map((item, index) => {
                if (balance > -1) {
                  item.HeadPhone = self.isActive;
                  WebRtcClient.setChannelSources(self.previewId, index, item);
                } else if (index == self.channelIndex) {
                  item.HeadPhone = self.isActive;
                  WebRtcClient.setChannelSources(
                    self.previewId,
                    self.channelIndex,
                    item
                  );
                }
              });
            }
          });
        }

        if (property == "Master" && this.master) {
          if (self.advanceMix) {
            self.audioSources.Master.Channels.forEach(function (
              channel,
              channelIndex
            ) {
              channel.HeadPhone = self.isActive;
              WebRtcClient.setChannelSources(
                self.previewId,
                channelIndex,
                self.audioSources.Master.Channels[channelIndex]
              );
            });
          } else {
            this.audioSources.Master.Channels[0].HeadPhone = self.isActive;
            this.audioSources.Master.Channels[1].HeadPhone = self.isActive;
            WebRtcClient.setChannelSources(
              self.previewId,
              0,
              this.audioSources.Master.Channels[0]
            );
            WebRtcClient.setChannelSources(
              self.previewId,
              1,
              this.audioSources.Master.Channels[1]
            );
          }

          this.outputArray.forEach((element) => {
            WebRtcClient.changeGainLeft(element.previewID);
            WebRtcClient.changeGainRight(element.previewID);
          });
        }
      }

      this.$store.dispatch(
        "audioSource/actionUpdateAudioSourcesByGainValue",
        this.audioSources
      );

      if (!this.isActive) {
        if (this.groupNumber !== undefined) {
          if (this.audioGroups.Groups[this.groupNumber - 1].ChannelIds.length) {
            this.audioGroups.Groups[this.groupNumber - 1].ChannelIds.map(
              (element) => {
                let channelId = element.split("-");
                let previewID = channelId[0];
                let channelIndex = channelId[1];
                let source = self.audioSources.Sources.filter((item) => {
                  return previewID == item.ID;
                });
                self.audioGroups.Groups[self.groupNumber - 1].HeadPhone =
                  self.isActive;
                this.$store.dispatch(
                  "audioSource/actionSetHeadPhoneStateInGroup",
                  self.audioGroups.Groups
                );
                if (source[0].Balance > -1) {
                  WebRtcClient.setGroupData(
                    self.audioGroups.Groups[self.groupNumber - 1],
                    self.groupNumber
                  );
                  WebRtcClient.changeGainLeft(source[0].PreviewID);
                  WebRtcClient.changeGainRight(source[0].PreviewID);
                }
                WebRtcClient.setGroupData(
                  self.audioGroups.Groups[self.groupNumber - 1],
                  self.groupNumber
                );
                if (channelIndex == 0) {
                  WebRtcClient.changeGainLeft(source[0].PreviewID);
                }
                if (channelIndex == 1) {
                  WebRtcClient.changeGainRight(source[0].PreviewID);
                }
              }
            );
          } else {
            self.audioGroups.Groups[self.groupNumber - 1].HeadPhone =
              self.isActive;
            this.$store.dispatch(
              "audioSource/actionSetHeadPhoneStateInGroup",
              self.audioGroups.Groups
            );
          }
        }

        if (this.balance < 0) {
          WebRtcClient.changeGainLeft(this.previewId);
          WebRtcClient.changeGainRight(this.previewId);
        } else {
          if (this.channelIndex == 0) {
            WebRtcClient.changeGainLeft(this.previewId);
          } else {
            WebRtcClient.changeGainRight(this.previewId);
          }
        }

        localMuteData.isLocalMute = true;
        localMuteData.channelIndex = this.channelIndex;
        localMuteData.previewId = this.previewId;
        this.$store.dispatch("audioSource/actionSetLocalMute", localMuteData);
      } else {
        if (this.groupNumber !== undefined) {
          if (this.audioGroups.Groups[this.groupNumber - 1].ChannelIds.length) {
            this.audioGroups.Groups[this.groupNumber - 1].ChannelIds.map(
              (element) => {
                let channelId = element.split("-");
                let previewID = channelId[0];
                let channelIndex = channelId[1];
                let source = self.audioSources.Sources.filter((item) => {
                  return previewID == item.ID;
                });
                self.audioGroups.Groups[self.groupNumber - 1].HeadPhone =
                  self.isActive;
                this.$store.dispatch(
                  "audioSource/actionSetHeadPhoneStateInGroup",
                  self.audioGroups.Groups
                );
                if (source[0].Balance > -1) {
                  WebRtcClient.setGroupData(
                    self.audioGroups.Groups[self.groupNumber - 1],
                    self.groupNumber
                  );
                  WebRtcClient.changeGainLeft(source[0].PreviewID);
                  WebRtcClient.changeGainRight(source[0].PreviewID);
                }
                WebRtcClient.setGroupData(
                  self.audioGroups.Groups[self.groupNumber - 1],
                  self.groupNumber
                );
                if (channelIndex == 0) {
                  WebRtcClient.changeGainLeft(source[0].PreviewID);
                }
                if (channelIndex == 1) {
                  WebRtcClient.changeGainRight(source[0].PreviewID);
                }
              }
            );
          } else {
            self.audioGroups.Groups[self.groupNumber - 1].HeadPhone =
              self.isActive;
            this.$store.dispatch(
              "audioSource/actionSetHeadPhoneStateInGroup",
              self.audioGroups.Groups
            );
          }
        }

        if (this.balance < 0) {
          WebRtcClient.changeGainLeft(this.previewId);
          WebRtcClient.changeGainRight(this.previewId);
        } else {
          if (this.channelIndex == 0) {
            WebRtcClient.changeGainLeft(this.previewId);
          } else {
            WebRtcClient.changeGainRight(this.previewId);
          }
        }
        localMuteData.isLocalMute = false;
        localMuteData.channelIndex = this.channelIndex;
        localMuteData.previewId = this.previewId;
        this.$store.dispatch("audioSource/actionSetLocalUnMute", localMuteData);
      }
    },
  },
};
</script>
