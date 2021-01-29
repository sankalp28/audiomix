<template>
  <div class="grid-column">
    <div class="column-top">
      <VideoSource
        :videoSourceIndex="this.sourceIndex"
        :previewId="this.previewId"
        :master="this.master"
        :headphone="false"
        :speaker="true"
        :rtilCode="this.rtilCode"
      />
    </div>
    <div class="vertical-slider">
      <div :class="getAudioClass">
        <p>Source {{ this.sourceIndex }}</p>
        <!-- <p><button v-on:click="createClient">Create Client</button></p> -->
        <!-- <p><button v-on:click="initClient">Init Client</button></p> -->
        <!-- <p><button v-on:click="joinClient">Join Client</button></p> -->
        <!-- <div :id="agoraIDD" class="agora-test-class"> -->
        <!-- <div id="" class="agora-test-class">
          test
        </div> -->
        <component
          :is="dynamicComponent"
          v-bind="currentProperties"
        ></component>
      </div>
    </div>
  </div>
</template>
<script>
import MultipleChannel from "./MultipleChannel.vue";
import VideoSource from "./VideoSource.vue";
import MultipleChannelSterioForEightChannel from "./MultipleChannelSterioForEightChannel.vue";
import MultipleChannelSterio from "./MultipleChannelSterio.vue";
import { WebRtcClient } from "../webRTC/localClient";
//import { AgoraRtcClient } from "../agoraRTC/agoraRTC";
import { mapState } from "vuex";
export default {
  components: {
    MultipleChannel,
    VideoSource,
    MultipleChannelSterioForEightChannel,
    MultipleChannelSterio
  },
  props: {
    sourceIndex: {
      type: Number,
    },
    previewId: {
      type: String,
    },
    noOfChannels: {
      type: Number,
    },
    channelGains: {
      type: Array,
    },
    sourceName: {
      type: String,
    },
    sourceId: {
      type: String,
    },
    master: {
      type: Boolean,
    },
    balanceVal: {
      type: Number,
    },
    rtilCode: {
      type: String,
    },
    pairSelected: {
      type: Number,
    },
  },
  computed: {
    ...mapState({
      advanceMix: (state) => state.audioSource.advanceMix,
      agoraMeetingTokenData: (state) => state.audioSource.agoraMeetingTokenData,
    }),
    // ...mapState({
    //   localUnmute: (state) => state.audioSource.localUnmute,
    //   localMute: (state) => state.audioSource.localMute,
    //   afvState: (state) => state.audioSource.afvState,
    // }),
    currentProperties() {
      return {
        channelsToRepeat: this.noOfChannels,
        gain: this.channelGains,
        sourceName: this.sourceName,
        sourceId: this.sourceId,
        previewId: this.previewId,
        balanceVal: this.balanceVal,
        pairSelected: this.pairSelected,
        sourceIndex: this.sourceIndex,
      };
    },
    dynamicComponent() {
      if (this.noOfChannels > 1 && this.balanceVal < 0) {
        return MultipleChannel;
      } else if (this.noOfChannels > 1 && this.balanceVal > 0 && this.advanceMix) {
        return MultipleChannelSterioForEightChannel
      }else {
        return MultipleChannelSterio;
      }
    },
    getAudioClass() {
      if (this.noOfChannels > 1) {
        return "audio-mixer";
      } else {
        return "audio-mixer single-audio";
      }
    },
  },

  mounted() {
    this.disconnectRemotePeerOnPageRefresh();
  },
  data() {
    return {
      agoraIDD: null,
      //agoraMeetingTokenData:[]
    };
  },
  methods: {
    disconnectRemotePeerOnPageRefresh() {
      // Use getEntriesByType() to just get the "navigation" events
      var perfEntries = performance.getEntriesByType("navigation");
      for (var i = 0; i < perfEntries.length; i++) {
        var p = perfEntries[i];
        if (p.type === "reload") {
          // if page gets refreshed/reloaded, disconnect all peer connection before reconnecting
          WebRtcClient.disconnectRemotePeer(this.previewId);
        }
      }
    },
    // createClient(){
    //   window.console.log('test1')
    //   //AgoraRtcClient.init();
    //   AgoraRtcClient.createClient();

    // },
    initClient() {
      window.console.log("initClient");
      WebRtcClient.callInitAgora(this.agoraMeetingTokenData);
      //AgoraRtcClient.initClient(this.callbackAgora())
      //AgoraRtcClient.init(null,this.callbackSelfId)
      //AgoraRtcClient.RTCEvents(this.callbackAgora)
    },
    // callbackSelfId(selfId){
    //   window.console.log(selfId)
    // },

    // joinClient(){
    //   window.console.log('joinClient')
    //   AgoraRtcClient.joinClient()
    // },
    // callbackAgora(eventType, agoraId){
    //   window.console.log("====++>>>::::::::::::::::::::"+agoraId)
    //   this.agoraIDD = agoraId;
    //   //this.agoraIDD = "test";
    //   //window.console.log("agora iddddddddddddd====>>>>"+this.agoraIDD)
    // }
  },
};
</script>
<style scoped>
.agora-test-class {
  height: 200px;
  width: 200px;
}
</style>
