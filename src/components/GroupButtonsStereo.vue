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
      return this.sourceId;
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
          let selectedSource = this.audioSourceData.response.Sources.filter(
            (item) => {
              return item.ID == sourceID;
            }
          );
          let previewId = selectedSource[0].PreviewID;

          if (selectedSource[0].Balance > -1) {
            // add Group property to related channel
            let element1 = selectedSource[0].Channels[0];
            element1.Group = index + 1;

            let element2 = selectedSource[0].Channels[1];
            element2.Group = index + 1;

            // set chennel sources with above calculated values
            WebRtcClient.setChannelSources(previewId, 0, element1);
            WebRtcClient.setChannelSources(previewId, 1, element2);
          }
        });
      });
    },
    toggleGroup1(sourceID) {
      let self = this;
      this.isActive1 = !this.isActive1;
      let _data0 = {
        sourceID: `${sourceID}-0`,
        previewId: this.previewId,
        channelIndex: this.index,
      };
      let _data1 = {
        sourceID: `${sourceID}-1`,
        previewId: this.previewId,
        channelIndex: this.index,
      };
      if (this.isActive1 == true) {
        this.isActive2 = !this.isActive1;

        this.$store.dispatch(
          "audioSource/actionSetSelectedSourceInGroup1",
          _data0
        );
        this.$store.dispatch(
          "audioSource/actionSetSelectedSourceInGroup1",
          _data1
        );
        this.audioSourceData.response.Sources.map((item) => {
          if (item.PreviewID == self.previewId) {
            item.Channels.map((element, index) => {
              element.Group = 1;
              WebRtcClient.setChannelSources(self.previewId, index, element);
              WebRtcClient.setGroupData(self.groupSources.Groups[0], 1);
              WebRtcClient.changeGainLeft(self.previewId);
              WebRtcClient.changeGainRight(self.previewId);
            });
          }
        });
      } else {
        this.$store.dispatch(
          "audioSource/actionRemoveSelectedSourceFromGroup1",
          _data0
        );
        this.$store.dispatch(
          "audioSource/actionRemoveSelectedSourceFromGroup1",
          _data1
        );
        this.audioSourceData.response.Sources.map((item) => {
          if (item.PreviewID == self.previewId) {
            item.Channels.map((element, index) => {
              element.Group = null;
              WebRtcClient.setChannelSources(self.previewId, index, element);
              WebRtcClient.setGroupData(self.groupSources.Groups[0], 1);
              WebRtcClient.changeGainLeft(self.previewId);
              WebRtcClient.changeGainRight(self.previewId);
            });
          }
        });
      }
    },
    toggleGroup2(sourceID) {
      let self = this;
      this.isActive2 = !this.isActive2;
      let _data0 = {
        sourceID: `${sourceID}-0`,
        previewId: this.previewId,
        channelIndex: this.index,
      };
      let _data1 = {
        sourceID: `${sourceID}-1`,
        previewId: this.previewId,
        channelIndex: this.index,
      };
      if (this.isActive2 == true) {
        this.isActive1 = !this.isActive2;

        this.$store.dispatch(
          "audioSource/actionSetSelectedSourceInGroup2",
          _data0
        );
        this.$store.dispatch(
          "audioSource/actionSetSelectedSourceInGroup2",
          _data1
        );
        this.audioSourceData.response.Sources.map((item) => {
          if (item.PreviewID == self.previewId) {
            item.Channels.map((element, index) => {
              element.Group = 2;
              WebRtcClient.setChannelSources(self.previewId, index, element);
              WebRtcClient.setGroupData(self.groupSources.Groups[1], 2);
              WebRtcClient.changeGainLeft(self.previewId);
              WebRtcClient.changeGainRight(self.previewId);
            });
          }
        });
      } else {
        this.$store.dispatch(
          "audioSource/actionRemoveSelectedSourceFromGroup2",
          _data0
        );
        this.$store.dispatch(
          "audioSource/actionRemoveSelectedSourceFromGroup2",
          _data1
        );
        this.audioSourceData.response.Sources.map((item) => {
          if (item.PreviewID == self.previewId) {
            item.Channels.map((element, index) => {
              element.Group = null;
              WebRtcClient.setChannelSources(self.previewId, index, element);
              WebRtcClient.setGroupData(self.groupSources.Groups[1], 2);
              WebRtcClient.changeGainLeft(self.previewId);
              WebRtcClient.changeGainRight(self.previewId);
            });
          }
        });
      }
    },
  },
};
</script>
