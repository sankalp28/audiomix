<template>
  <div class="grid">
    <span class="grey number">{{ videoSourceIndex }}</span>

    <video
      :id="getPreviewIdVideo"
      :remoteKey="previewId"
      autoplay
      :muted="muted"
      controls
      width="100%"
      height="100%"
      @play="handlePlay()"
    ></video>
    <audio
      :id="getPreviewIdAudio"
      :remoteKey="previewId"
      :muted="audioMuted"
    ></audio>
  </div>
</template>
<script>
import { WebRtcClient } from "../webRTC/localClient";
import { mapGetters, mapState } from "vuex";
export default {
  props: {
    videoSourceIndex: {
      type: Number,
    },
    previewId: {
      type: String,
    },
    master: {
      type: Boolean,
    },
    headphone: {
      type: Boolean,
    },
    speaker: {
      type: Boolean,
    },
    rtilCode: {
      type: String,
    },
  },
  data() {
    return {
      muted: true,
      audioMuted: false,
    };
  },
  watch: {
    localMute() {
      this.muted = false;
    },
    gainValueLocal() {
      if (
        (this.groupSources.Groups[0].ChannelIds.length &&
          this.gainValueLocal.channelID == 0) ||
        (this.groupSources.Groups[1].ChannelIds.length &&
          this.gainValueLocal.channelID == 1)
      ) {
        let remoteKey = null;
        this.groupSources.Groups[this.gainValueLocal.channelID].ChannelIds.map(
          (item) => {
            let channelId = item.split("-");
            let sourceID = channelId[0];

            let selectedSource = this.audioSources.Sources.filter((item) => {
              return item.ID == sourceID;
            });
            remoteKey = selectedSource[0].PreviewID;

            WebRtcClient.changeGainLeft(remoteKey);

            WebRtcClient.changeGainRight(remoteKey);
          }
        );
      } else {
        if (Array.isArray(this.gainValueLocal.gainValue)) {
          WebRtcClient.changeGainLeft(this.previewId);
          WebRtcClient.changeGainRight(this.previewId);
        } else {
          if (this.gainValueLocal.channelID == 0) {
            let inputElement = {};
            inputElement.remoteKey = this.gainValueLocal.previewID;
            inputElement.headphone = this.headphone;
            inputElement.speaker = this.speaker;
            inputElement.faderValue = this.gainValueLocal.previewID;
            WebRtcClient.changeGainLeft(this.previewId);
          } else {
            WebRtcClient.changeGainRight(this.previewId);
          }
        }
      }
    },
    gainValueLocalGroup() {
      if (
        this.groupSources.Groups[this.gainValueLocalGroup.GroupNumber]
          .ChannelIds.length
      ) {
        let channelIndex = null;
        let remoteKey = null;
        this.groupSources.Groups[
          this.gainValueLocalGroup.GroupNumber
        ].ChannelIds.map((item) => {
          let channelId = item.split("-");
          let sourceID = channelId[0];
          channelIndex = channelId[1];
          let selectedSource = this.audioSources.Sources.filter((item) => {
            return item.ID == sourceID;
          });
          remoteKey = selectedSource[0].PreviewID;
          if (selectedSource[0]) {
            if (channelIndex == 0) {
              WebRtcClient.changeGainLeft(remoteKey);
            } else {
              WebRtcClient.changeGainRight(remoteKey);
            }
          }
        });
      }
    },
    selectedPairValueForSource() {
      window.console.log("audio goig");
      let self = this;
      this.audioMuted = true;
      setTimeout(() => {
        self.audioMuted = false;
        window.console.log("audio goig2");
      }, 3000);
    },
    audioSources(newVal, oldVal) {
      let self = this;
      let oldPreviewId;
      oldVal.Sources.forEach((element) => {
        if (element.Index === 5) {
          oldPreviewId = element.PreviewID;
        }
      });
      if (oldPreviewId !== undefined) {
        this.audioSources.Sources.forEach((element) => {
          if (element.Index === 5 && element.PreviewID !== oldPreviewId) {
            if (!this.rtilCode) {
              WebRtcClient.disconnectRemotePeer(oldPreviewId);
              WebRtcClient.connectToRemotePeer(
                element.PreviewID,
                false,
                function(isVideoLoaded) {
                  self.$store.dispatch(
                    "audioSource/actionIsVideoLoaded",
                    isVideoLoaded
                  );
                },
                function(id, value, newVolumeValue) {
                  let previewId = element.PreviewID;
                  self.$store.dispatch("audioSource/actionSetVolume", {
                    value,
                    previewId,
                    newVolumeValue,
                  });
                },
                function(id, value, newVolumeValue) {
                  let previewId = self.previewId;
                  self.$store.dispatch("audioSource/actionSetVolumeForGroup1", {
                    value,
                    previewId,
                    newVolumeValue,
                  });
                },
                function(id, value, newVolumeValue) {
                  let previewId = self.previewId;
                  self.$store.dispatch("audioSource/actionSetVolumeForGroup2", {
                    value,
                    previewId,
                    newVolumeValue,
                  });
                }
              );
            }
          }
        });
      }
    },
    horizontalScrollState() {
      if (this.horizontalScrollState) {
        const videoElement = document.getElementById(this.getPreviewIdVideo);
        if (videoElement.paused) {
          videoElement.play();
        }
      }
    },
  },
  computed: {
    ...mapState({
      localMute: (state) => state.audioSource.localMute,
      audioSources: (state) => state.audioSource.audioSourceData.response,
      agoraMeetingTokenData: (state) => state.audioSource.agoraMeetingTokenData,
      horizontalScrollState: (state) => state.audioSource.horizontalScrollState,
      selectedPairValueForSource: (state) =>
        state.audioSource.selectedPairValueForSource,
    }),
    ...mapGetters({
      leftRightPanValue: "audioSource/leftRightPanValue",
      gainValueLocal: "audioSource/gainValueLocal",
      gainValueLocalGroup: "audioGroup/gainValueLocalGroup",
      groupSources: "audioSource/groupList",
    }),
    getPreviewIdVideo() {
      if (this.master) {
        return this.previewId + "_remote_video_master";
      } else {
        return this.previewId + "_remote_video";
      }
    },
    getPreviewIdAudio() {
      if (this.master) {
        return this.previewId + "_remote_audio_master";
      } else {
        return this.previewId + "_remote_audio";
      }
    },
  },
  mounted() {
    let self = this;
    WebRtcClient.initWebRtc();
    window.console.log("self.rtilCode====>>>>", self.rtilCode);
    window.console.log("self.preview ID====>>>>", self.previewId);

    // if (!self.rtilCode) {
    setTimeout(() => {
      WebRtcClient.connectToRemotePeer(
        self.previewId,
        self.rtilCode,
        self.master,
        function(isVideoLoaded) {
          self.$store.dispatch(
            "audioSource/actionIsVideoLoaded",
            isVideoLoaded
          );
        },
        function(id, value, newVolumeValue) {
          let previewId = self.previewId;
          self.$store.dispatch("audioSource/actionSetVolume", {
            value,
            previewId,
            newVolumeValue,
          });
        },
        function(id, value, newVolumeValue) {
          let previewId = self.previewId;
          self.$store.dispatch("audioSource/actionSetVolumeForGroup1", {
            value,
            previewId,
            newVolumeValue,
          });
        },
        function(id, value, newVolumeValue) {
          let previewId = self.previewId;
          self.$store.dispatch("audioSource/actionSetVolumeForGroup2", {
            value,
            previewId,
            newVolumeValue,
          });
        }
      );
    }, 5000);
    window.console.log(self.previewId);
    // } else {
    //   window.console.log("else calling rtil from video----->>>");
    //   WebRtcClient.callRtil(
    //     self.previewId,
    //     this.rtilCode,
    //     function(id, value, newVolumeValue) {
    //       let previewId = self.previewId;
    //       self.$store.dispatch("audioSource/actionSetVolume", {
    //         value,
    //         previewId,
    //         newVolumeValue,
    //       });
    //     },
    //     function(id, value, newVolumeValue) {
    //       let previewId = self.previewId;
    //       self.$store.dispatch("audioSource/actionSetVolumeForGroup1", {
    //         value,
    //         previewId,
    //         newVolumeValue,
    //       });
    //     },
    //     function(id, value, newVolumeValue) {
    //       let previewId = self.previewId;
    //       self.$store.dispatch("audioSource/actionSetVolumeForGroup2", {
    //         value,
    //         previewId,
    //         newVolumeValue,
    //       });
    //     }
    //   );
    // }

    //this.initClient();
  },
  methods: {
    handlePlay() {
      let previewId = this.previewId;
      let status = true;
      let masterOutput = false;
      let self = this;
      this.audioSources.Sources.forEach((element) => {
        element.Channels.forEach(item => {
          if(item.Output){
            masterOutput = item.Output;
          }
        })
      })
      this.$store.dispatch("audioSource/actionSetVidePlayedStatus", {
        previewId,
        status,
      });
      if(masterOutput){
        setTimeout(function(){
          let previewId = self.audioSources.Master.PreviewID;
        self.$store.dispatch("audioSource/actionSetVidePlayedStatus", {
        previewId,
        status,
      });
        }, 500)
      }
    },
    initClient() {
      window.console.log("initClient");
      WebRtcClient.callInitAgora(this.agoraMeetingTokenData);
    },
  },
};
</script>
<style scoped>
.agora-advdio-class {
  height: 100px;
  width: 100px;
}
</style>
