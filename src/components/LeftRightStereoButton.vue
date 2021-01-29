<template>
  <div class="btn-sec">
    <span
      ><button
        :class="['btn muteButton lt', isOutputTrue ? 'orange' : 'mute']"
        v-on="afv ? null : { click: toggleOutput }"
        :disabled="isAudioButtonDisable"
      >
        <span>Left</span> <span>Right</span>
      </button></span
    >
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
    channelIndex: {
      type: Number,
    },
    isMute: {
      type: Boolean,
    },
    isSolo: {
      type: Boolean,
    },
    isOutput: {
      type: Boolean,
    },
    isOutputDisabled: {
      type: Boolean,
    },
  },
  data() {
    return {
      mute: this.isMute,
      solo: this.isSolo,
      disableButton: true,
      isDisableSole: false,
      localUnmuteData: [],
      localMuteData: [],
      isOutputTrue: true,
      isAudioButtonDisable: false,
      afv: true,
    };
  },
  mounted() {
    let self = this;
    this.isOutputTrue = this.isOutput;
    this.afv = this.audioSources.AFV;
    if (this.audioSources.AFV) {
      this.audioSources.Sources.forEach((element) => {
        element.Channels.forEach((item, index) => {
          if (
            self.previewId == element.PreviewID &&
            self.channelIndex == index &&
            item.Output == false
          ) {
            self.isAudioButtonDisable = item.OutputDisabled;
          }
        });
      });
    }
  },
  updated() {
    var muteButtons = document.getElementsByClassName("muteButton");
    if (document.getElementsByClassName("follow").length >= 1) {
      for (var k = 0; k < muteButtons.length; k++) {
        muteButtons[k].disabled = true;
      }
    }
  },
  computed: {
    ...mapGetters({
      audioSources: "audioSource/channelList",
    }),
    ...mapState({
      localUnmute: (state) => state.audioSource.localUnmute,
      localMute: (state) => state.audioSource.localMute,
      afvState: (state) => state.audioSource.afvState,
    }),
  },
  watch: {
    audioSources() {
      this.afv = this.audioSources.AFV;
      this.isOutputTrue = this.isOutput;
      if (this.audioSources.AFV) {
        if (this.isOutputDisabled == true) {
          this.isAudioButtonDisable = true;
        }
        if (this.isOutputDisabled == false) {
          this.isAudioButtonDisable = false;
        }
      } else {
        this.isAudioButtonDisable = false;
      }
    },
    localUnmute() {
      this.localUnmuteData = this.localUnmute;
      this.localMuteData = this.localMute;
    },
    afvState() {
      this.afv = this.audioSources.AFV;
      let _self = this;
      this.audioSources.Sources.forEach((element) => {
        element.Channels.forEach((item, index) => {
          if (
            _self.previewId == element.PreviewID &&
            _self.channelIndex == index &&
            item.Output == false
          ) {
            _self.isAudioButtonDisable = this.afvState;
          }
        });
      });
    },
  },
  methods: {
    toggleOutput() {
      this.isOutputTrue = !this.isOutputTrue;
      let previewID = this.previewId;
      let self = this;
      if (this.isOutputTrue) {
        for (let property1 in this.audioSources) {
          if (property1 == "Sources") {
            this.audioSources.Sources.map((item) => {
              if (item.PreviewID == previewID) {
                item.Channels.map((item, index) => {
                  item.Output = true;
                  item.OutputDisabled = false;
                  WebRtcClient.setChannelSources(self.previewId, index, item);
                });
              }
            });
          }
          // added below code, if state is updated through websocket, we need to re-initialise Master Headphone
          if (this.audioSources.AFV) {
            if (property1 == "Master") {
              if (this.audioSources.Master.Channels[0].HeadPhone == undefined) {
                this.audioSources.Master.Channels[0].HeadPhone = true;
                this.audioSources.Master.Channels[1].HeadPhone = true;
              }
            }
          }
        }
        this.$store.dispatch(
          "audioSource/actionSetIsOutputTrue",
          this.audioSources
        );
        WebRtcClient.changeGainLeft(this.previewId);
        WebRtcClient.changeGainRight(this.previewId);
      } else {
        for (let property1 in this.audioSources) {
          if (property1 == "Sources") {
            let afvState = this.audioSources.AFV;
            this.audioSources.Sources.map((item) => {
              if (item.PreviewID == previewID) {
                item.Channels.map((item) => {
                  item.Output = false;
                  if (afvState) {
                    item.OutputDisabled = false;
                  } else {
                    item.OutputDisabled = true;
                  }
                  WebRtcClient.setChannelSources(
                    self.previewId,
                    self.channelIndex,
                    item
                  );
                });
              }
            });
          }
        }
        this.$store.dispatch(
          "audioSource/actionSetIsOutputTrue",
          this.audioSources
        );
        WebRtcClient.changeGainLeft(this.previewId);
        WebRtcClient.changeGainRight(this.previewId);
      }
    },
  },
};
</script>
