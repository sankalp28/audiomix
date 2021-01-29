<template>
  <div class="audio-mixer-box">
    <div>
      <component
        :is="dynamicComponent"
        v-bind="currentProperties"
        class="audio-mixer-repeat single-source"
      ></component>
      <div
        class="dual-mono green"
        v-on="disableStereoButton ? null : { click: StereoDomoToggleBtn }"
      >
        Stereo
      </div>
    </div>
  </div>
</template>
<script>
import DualMonoChannel from "./DualMonoChannel.vue";
import StereoChannel from "./StereoChannel.vue";
import { WebRtcClient } from "../webRTC/localClient";
import { mapState } from "vuex";
export default {
  components: {
    StereoChannel,
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
  },
  data() {
    return {
      isStereoDomoToggleBtn: true,
    };
  },
  created() {},
  computed: {
    ...mapState({
      audioGroups: (state) => state.audioSource.audioGroupData.response,
      audioSources: (state) => state.audioSource.audioSourceData.response,
    }),
    // ...mapGetters({
    //   audioSources: "audioSource/channelList",
    // }),
    currentProperties() {
      return {
        channelsToRepeat: this.channelsToRepeat,
        gain: this.gain,
        sourceName: this.sourceName,
        sourceId: this.sourceId,
        previewId: this.previewId,
        balanceVal: this.balanceVal,
      };
    },
    dynamicComponent() {
      if (this.isStereoDomoToggleBtn) {
        return StereoChannel;
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
  methods: {
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
