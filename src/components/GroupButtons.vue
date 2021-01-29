<template>
  <div class="number-btn">
    <span
      :class="[isActive1 && !afvEnabled() ? 'green' : 'grey']"
      @[customClick]="toggleGroup1(getSourceID)"
      >1</span
    >
    <span
      :class="[isActive2 && !afvEnabled() ? 'green' : 'grey']"
      @[customClick]="toggleGroup2(getSourceID)"
      >2</span
    >
  </div>
</template>
<script>
import { mapState } from "vuex";
import { WebRtcClient } from "../webRTC/localClient";
export default {
  props: {
    active1: {
      type: Boolean,
    },
    active2: {
      type: Boolean,
    },
    sourceId: {
      type: String,
    },
    index: {
      type: Number,
    },
    previewId: {
      type: String,
    },
    isMute: {
      type: Boolean,
    },
  },
  computed: {
    customClick() {
      return !this.audioSourceData.response.AFV ? "click" : null;
    },
    ...mapState({
      afvState: (state) => state.audioSource.afvState,
      audioSourceData: (state) => state.audioSource.audioSourceData,
      groupSources: (state) => state.audioSource.audioGroupData.response,
    }),
    getSourceID() {
      return this.sourceId + "-" + this.index;
    },
  },

  data() {
    return {
      isActive1: this.active1,
      isActive2: this.active2,
      channelId1: 0,
      channelId2: 1,
    };
  },
  mounted() {
    this.initGroups();
  },
  watch: {
    groupSources() {
      this.initGroups();
      this.isActive1 = this.active1;
      this.isActive2 = this.active2;
    },
  },
  methods: {
    afvEnabled() {
      return this.audioSourceData.response.AFV;
    },
    initGroups() {
      // on mounted set channel sources for Groups
      this.groupSources.Groups.map((element, index) => {
        element.ChannelIds.map((item) => {
          // find source id, channel index and preview id from sources which are added into either Groups
          let channelId = item.split("-");
          let sourceID = channelId[0];
          let channelIndex = channelId[1];
          let selectedSource = this.audioSourceData.response.Sources.filter(
            (item) => {
              return item.ID == sourceID;
            }
          );
          let previewId = selectedSource[0].PreviewID;

          // add Group property to related channel
          let element = selectedSource[0].Channels[channelIndex];
          element.Group = index + 1;

          // set chennel sources with above calculated values
          WebRtcClient.setChannelSources(previewId, channelIndex, element);
        });
      });
    },
    toggleGroup1(sourceID) {
      let self = this;
      this.isActive1 = !this.isActive1;
      let _data = {
        sourceID,
        previewId: this.previewId,
        channelIndex: this.index,
      };
      if (this.isActive1 == true) {
        this.isActive2 = !this.isActive1;

        this.$store.dispatch(
          "audioSource/actionSetSelectedSourceInGroup1",
          _data
        );
        this.audioSourceData.response.Sources.map((item) => {
          if (item.PreviewID == self.previewId) {
            item.Channels.map((element, index) => {
              if (index == self.index) {
                element.Group = 1;
                WebRtcClient.setChannelSources(self.previewId, index, element);
                WebRtcClient.setGroupData(self.groupSources.Groups[0], 1);
                index == 0
                  ? WebRtcClient.changeGainLeft(self.previewId)
                  : WebRtcClient.changeGainRight(self.previewId);
              }
            });
          }
        });
      } else {
        this.$store.dispatch(
          "audioSource/actionRemoveSelectedSourceFromGroup1",
          _data
        );
        this.audioSourceData.response.Sources.map((item) => {
          if (item.PreviewID == self.previewId) {
            item.Channels.map((element, index) => {
              if (index == self.index) {
                element.Group = null;
                WebRtcClient.setChannelSources(self.previewId, index, element);
                WebRtcClient.setGroupData(self.groupSources.Groups[0], 1);
                index == 0
                  ? WebRtcClient.changeGainLeft(self.previewId)
                  : WebRtcClient.changeGainRight(self.previewId);
              }
            });
          }
        });
      }
    },
    toggleGroup2(sourceID) {
      let self = this;
      this.isActive2 = !this.isActive2;
      let _data = {
        sourceID,
        previewId: this.previewId,
        channelIndex: this.index,
      };
      if (this.isActive2 == true) {
        this.isActive1 = !this.isActive2;
        this.$store.dispatch(
          "audioSource/actionSetSelectedSourceInGroup2",
          _data
        );
        this.audioSourceData.response.Sources.map((item) => {
          if (item.PreviewID == self.previewId) {
            item.Channels.map((element, index) => {
              if (index == self.index) {
                element.Group = 2;
                WebRtcClient.setChannelSources(self.previewId, index, element);
                WebRtcClient.setGroupData(self.groupSources.Groups[1], 2);
                index == 0
                  ? WebRtcClient.changeGainLeft(self.previewId)
                  : WebRtcClient.changeGainRight(self.previewId);
              }
            });
          }
        });
      } else {
        this.$store.dispatch(
          "audioSource/actionRemoveSelectedSourceFromGroup2",
          _data
        );
        this.audioSourceData.response.Sources.map((item) => {
          if (item.PreviewID == self.previewId) {
            item.Channels.map((element, index) => {
              if (index == self.index) {
                element.Group = null;
                WebRtcClient.setChannelSources(self.previewId, index, element);
                WebRtcClient.setGroupData(self.groupSources.Groups[1], 2);
                index == 0
                  ? WebRtcClient.changeGainLeft(self.previewId)
                  : WebRtcClient.changeGainRight(self.previewId);
              }
            });
          }
        });
      }
    },
  },
};
</script>
