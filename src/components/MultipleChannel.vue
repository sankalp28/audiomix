<template>
  <div class="audio-mixer-box">
    <div>
      <component
        :is="dynamicComponent"
        v-bind="currentProperties"
        class="audio-mixer-repeat"
      ></component>
      <div
        class="dual-mono red"
        v-on="disableDualMonoButton ? null : { click: StereoDomoToggleBtn }"
      >
        Dual mono
      </div>
    </div>
  </div>
</template>
<script>
import DualMonoChannel from "./DualMonoChannel.vue";
import StereoChannel from "./StereoChannel.vue";
import StereoChannelForEightChannel from "./StereoChannelForEightChannel.vue";
import { WebRtcClient } from "../webRTC/localClient";
import { mapState } from "vuex";
export default {
  components: {
    DualMonoChannel,
    StereoChannel,
    StereoChannelForEightChannel,
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
      advanceMix: (state) => state.audioSource.advanceMix,
      volume: (state) => state.audioSource.volume,
      audioGroups: (state) => state.audioSource.audioGroupData.response,
      audioSources: (state) => state.audioSource.audioSourceData.response,
    }),
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
        return DualMonoChannel;
      } else if(this.advanceMix) {
        return StereoChannelForEightChannel
      } else {
        return StereoChannel;
      }
    },
    disableDualMonoButton() {
      let self = this;
      let dualMonoButtonState = false;
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
            dualMonoButtonState = true;
          }
        });
      });
      return dualMonoButtonState;
    },
  },
  methods: {
    StereoDomoToggleBtn() {
      let self = this;
      this.isStereoDomoToggleBtn = !this.isStereoDomoToggleBtn;
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
          if (self.previewId == previewId && channelIndex == 0 && index == 1) {
            this.$store.dispatch(
              "audioSource/actionSetSelectedSourceInGroup2",
              `${sourceID}-1`
            );
          }
        });
      });

      for (let property in this.audioSources) {
        if (property == "Sources") {
          this.audioSources.Sources.map((item) => {
            if (item.PreviewID == this.previewId) {
              item.Balance = 50;

              // reset Pan value for API, when user switches between dual-mono to stereo and vice-versa
              item.Channels.forEach((element, index) => {
                if (index == 0) {
                  element.Pan = 0;

                  // if left channels Output is true, make right channels Output true also, so that in stereo
                  // both the channels rendered as true/ on state
                  if (element.Output) {
                    item.Channels[1].Output = true;
                  }

                  // if left channels isMute is true, make right channels isMute true also, so that in stereo
                  // both the channels rendered as true/ on state
                  if (element.isMute) {
                    item.Channels[1].isMute = true;
                  }

                  // if left channels HeadPhone is true, make right channels HeadPhone true also, so that in stereo
                  // both the channels rendered as true/ on state
                  if (element.HeadPhone) {
                    item.Channels[1].HeadPhone = true;
                  }
                } else {
                  element.Pan = 100;

                  // if right channels Output is true, make left channels Output true also, so that in stereo
                  // both the channels rendered as true/ on state
                  if (element.Output) {
                    item.Channels[0].Output = true;
                  }

                  // if right channels isMute is true, make left channels isMute true also, so that in stereo
                  // both the channels rendered as true/ on state
                  if (element.isMute) {
                    item.Channels[0].isMute = true;
                  }

                  // if right channels HeadPhone is true, make left channels HeadPhone true also, so that in stereo
                  // both the channels rendered as true/ on state
                  if (element.HeadPhone) {
                    item.Channels[0].HeadPhone = true;
                  }
                }
              });
            }
          });
        }
      }

      this.$store.dispatch("audioSource/actionSetGainValue", this.audioSources);

      // reset Pan for webRTC, when user switches between dual-mono to stereo and vice-versa
      WebRtcClient.changePan(this.previewId, -1, 0);
      WebRtcClient.changePan(this.previewId, 1, 1);
    },
  },
};
</script>
