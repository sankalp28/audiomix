<template>
  <div class="left-section">
    <div class="swith-toggle" v-if="!advanceMix">
      <p>AFV</p>
      <el-switch
        v-model="afvState"
        active-color="#294b25"
        inactive-color="#3d3f40"
        @change="handleChangeAFVStateChange"
      >
      </el-switch>
    </div>
    <div class="left-sec-slider">
      <div class="left-slider">
        <el-slider
          v-model="faderValue"
          vertical
          :step="0.01"
          height="144px"
          :max="1"
          :min="0"
          :show-tooltip="false"
          @input="handleChangeMonitorLevel"
        ></el-slider>
      </div>
      <p>Monitor <br />level</p>
    </div>
  </div>
</template>
<script>
import { mapState } from "vuex";
import { WebRtcClient } from "../../webRTC/localClient";
export default {
  data() {
    return {
      faderValue: 0.5,
      afvState: false,
      audioSources: null,      
    };
  },
  computed: {
    // On page load check if AFV is on, in API
    ...mapState({
      afv: (state) => state.audioSource.audioSourceData.response.AFV,
      advanceMix: (state) => state.audioSource.advanceMix,
      audioSourceData: (state) => state.audioSource.audioSourceData.response,
      localUnmuteData: (state) => state.audioSource.localUnmute,
      localMuteData: (state) => state.audioSource.localMute,
    }),
  },
  watch: {
    afv() {
      this.afvState = this.afv;
    },
    audioSourceData() {
      this.audioSources = this.audioSourceData;
    },
  },
  mounted() {
    // On page load, assign afv value to local data
    this.afvState = this.afv;
    this.audioSources = this.audioSourceData;
  },
  methods: {
    handleChangeMonitorLevel() {
      WebRtcClient.monitorLevelValue(this.faderValue);
      for (let property in this.audioSources) {
        if (property == "Sources") {
          this.audioSources.Sources.map((element) => {
            element.Channels.map(() => {
              // console.log(element.PreviewID);
              // console.log(index);
              // console.log(item);
              // WebRtcClient.setChannelSources(element.PreviewID, index, item);
              WebRtcClient.changeGainLeft(element.PreviewID);
              WebRtcClient.changeGainRight(element.PreviewID);
            });
          });
        }
        // if (property == "Master") {
        //   // console.log("master");
        //   WebRtcClient.setChannelSources(
        //     this.audioSources.Master.PreviewID,
        //     0,
        //     this.audioSources.Master.Channels[0]
        //   );
        //   WebRtcClient.changeGainLeft(this.audioSources.Master.PreviewID);
        //   WebRtcClient.changeGainRight(this.audioSources.Master.PreviewID);
        // }
      }
    },
    handleChangeAFVStateChange() {
      for (let key in this.audioSources) {
        if (key == "AFV") {
          this.audioSources.AFV = this.afvState;
        }
      }
      let audioSources = this.audioSources;
      let afvState = this.afvState;
      this.$store.dispatch("audioSource/actionSetAFVState", {
        audioSources,
        afvState,
      });
    },
  },
};
</script>
