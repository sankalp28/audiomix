<template>
  <div
    class=""
    style="height: 100vh"
    v-loading="!videoLoaded"
    element-loading-text="Loading..."
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <LeftPanel v-if="groupDataLoaded" />
    <AudioMixer />
    <MasterOutput v-if="groupDataLoaded" />
  </div>
</template>
<script>
import LeftPanel from "../components/common/LeftPanel.vue";
import AudioMixer from "../components/AudioMixer.vue";
import { mapState } from "vuex";
export default {
  components: {
    LeftPanel,
    AudioMixer,
    MasterOutput: () => import("../components/MasterOutput"),
  },
  data() {
    return {
      videoLoaded: false,
    };
  },
  computed: {
    ...mapState({
      isLoading: (state) =>
        state.audioSource.audioSourceData.isFechingAudioSourceData,
      isVideoLoaded: (state) => state.audioSource.isVideoLoaded.data,
      groupDataLoaded: (state) => state.audioSource.groupDataLoaded,
      SourceDataLoaded: (state) => state.audioSource.SourceDataLoaded,
      audioSourceData: (state) => state.audioSource.audioSourceData.response,
    }),
  },
  watch: {
    isVideoLoaded() {
      this.videoLoaded = this.isVideoLoaded;
    },
  },
};
</script>
