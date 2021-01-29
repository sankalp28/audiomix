<template>
  <div class="btn-sec btn-mute">
    <div class="muteIcon">
      <span v-if="!isActiveMute" class="icon iconfont" @click="toggleMute"
        >&#xe61d;</span
      >
      <span v-else class="icon iconfont disabled" @click="toggleMute"
        >&#xe69d;</span
      >
    </div>
  </div>
</template>
<script>
import { WebRtcClient } from "../webRTC/localClient";
import { mapState } from "vuex";
import common from "../mixins/common";
export default {
  mixins: [common],
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
  },
  data() {
    return {
      isActiveMute: false,
    };
  },
  mounted() {
    this.initMute();
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
    ...mapState({
      audioSourceData: (state) => state.audioSource.audioSourceData.response,
      forceUpdateKey: (state) => state.audioSource.forceUpdateKey,
      groupMute: (state) => state.audioSource.groupMute,
    }),
  },
  watch: {
    forceUpdateKey() {
      this.initMute();
    },
    audioSourceData() {
      this.initMute();
    },
    groupMute() {
      if (this.groupMute.mute) {
        if (
          this.previewId == this.groupMute.previewId &&
          this.channelIndex == this.groupMute.channelIndex
        ) {
          this.toggleMute();
        }
      }
    },
  },
  methods: {
    initMute() {
      let self = this;
      this.audioSourceData.Sources.forEach((element) => {
        element.Channels.forEach((item, index) => {
          if (
            self.previewId == element.PreviewID &&
            self.channelIndex == index
          ) {
            self.isActiveMute = item.isMute;
          }
        });
      });
    },
    toggleMute() {
      this.isActiveMute = !this.isActiveMute;
      let self = this;
      this.audioSourceData.Sources.map((item) => {
        if (item.PreviewID == self.previewId) {
          item.Channels.map((item, index) => {
            if (self.channelIndex == index) {
              item.isMute = self.isActiveMute ? true : false;
              WebRtcClient.setChannelSources(
                self.previewId,
                self.channelIndex,
                item
              );
              self.channelIndex === 0
                ? WebRtcClient.changeGainLeft(self.previewId)
                : WebRtcClient.changeGainRight(self.previewId);
              this.$store.dispatch(
                "audioSource/actionSetGainValue",
                this.audioSourceData
              );
            }
          });
        }
      });
    },
  },
};
</script>
