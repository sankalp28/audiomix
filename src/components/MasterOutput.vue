<template>
  <div class="right-section">
    <div class="right-video" :style="{ width: '20.3125vw', height: '150px' }">
      <iframe
        :src="`${getUrlConstant().pgmPreviewUrl}/${productionId}`"
        width="100%"
        height="100%"
        class="noBorder"
      ></iframe>
      <VideoSource
        :previewId="masterData.PreviewID"
        :gains="masterData.Channels"
        :master="true"
        style="display: none"
      />
      <span class="program orange-bg">Program</span>
    </div>
    <div class="right-audio-mixer">
      <GroupOutput1
        v-if="groupSliders[0] !== undefined && !advanceMix"
        :mixerName="groupSliders[0].GroupName"
        :gain="groupSliders[0].Gain"
        :channel="groupSliders[0].ChannelIds"
        :isMute="groupSliders[0].isMute"
      />
      <GroupOutput2
        v-if="groupSliders[1] !== undefined && !advanceMix"
        :mixerName="groupSliders[1].GroupName"
        :gain="groupSliders[1].Gain"
        :channel="groupSliders[1].ChannelIds"
        :isMute="groupSliders[1].isMute"
      />
      <MixerOutput
        v-if="masterData.Channels !== undefined"
        v-bind="masterOutputProps"
        :master="true"
      />
    </div>
  </div>
</template>
<script>
import MixerOutput from "./MixerOutput.vue";
import VideoSource from "./VideoSource.vue";
import GroupOutput1 from "./GroupOutPut1.vue";
import GroupOutput2 from "./GroupOutPut2.vue";
import { mapState } from "vuex";
import common from "../mixins/common";
export default {
  mixins: [common],
  components: {
    MixerOutput,
    VideoSource,
    GroupOutput1,
    GroupOutput2,
  },
  data() {
    return {
      groupSliders: [],
      masterData: {},
      videoLoaded: false,
      groupDataReady: false,
      sourceDataReady: false,
    };
  },
  computed: {
    ...mapState({
      advanceMix: (state) => state.audioSource.advanceMix,
      audioSource: (state) => state.audioSource.audioSourceData.response,
      audioGroup: (state) => state.audioSource.audioGroupData.response,
      groupDataLoaded: (state) => state.audioSource.groupDataLoaded,
      SourceDataLoaded: (state) => state.audioSource.SourceDataLoaded,
      isVideoLoaded: (state) => state.audioSource.isVideoLoaded.data,
      productionId: (state) =>
        state.audioSource.audioSourceData.response.productionId,
    }),
    masterOutputProps() {
      if (this.advanceMix) {
        return {
          mixerName: "Master",
          previewId: this.masterData.PreviewID,
          gain: this.masterData.Channels[0].Gain,
          advanceGainPair1: this.masterData.Channels[0].AdvanceGain[0],
          advanceGainPair2: this.masterData.Channels[2].AdvanceGain[2],
          advanceGainPair3: this.masterData.Channels[4].AdvanceGain[4],
          advanceGainPair4: this.masterData.Channels[6].AdvanceGain[6],
          isMute: this.masterData.Channels[0].isMute,
          isMutePair1: this.masterData.Channels[0].isMute,
          isMutePair2: this.masterData.Channels[2].isMute,
          isMutePair3: this.masterData.Channels[4].isMute,
          isMutePair4: this.masterData.Channels[6].isMute,
        };
      } else {
        return {
          mixerName: "Master",
          previewId: this.masterData.PreviewID,
          gain: this.masterData.Channels[0].Gain,
          isMute: this.masterData.Channels[0].isMute,
        };
      }
    },
  },
  watch: {
    audioSource() {
      this.masterData = this.audioSource.Master;
    },
    audioGroup() {
      this.groupSliders = this.audioGroup.Groups;
    },
    isVideoLoaded() {
      this.videoLoaded = this.isVideoLoaded;
    },
    groupDataLoaded() {
      this.groupDataReady = this.groupDataLoaded;
    },
    SourceDataLoaded() {
      this.sourceDataReady = this.SourceDataLoaded;
    },
  },
  mounted() {
    let path = window.location.pathname.split("/");
    if (path.length == 3) {
      this.taskid = path[2];
    }
    if (path.length == 2) {
      this.taskid = path[1];
    }
    this.getAudioGroup();
    this.masterData = this.audioSource.Master;
    this.groupSliders = this.audioGroup.Groups;
  },
  methods: {
    getAudioGroup() {
      //this.$store.dispatch("audioGroup/actionGetAudioGroup", this.taskid);
    },
  },
};
</script>
<style scoped>
.noBorder {
  border: none;
}
</style>