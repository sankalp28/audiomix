<template>
  <div class="middle-section">
    <div
      :class="['middle-content', audioSources.length > 7 ? 'hr-scroll' : '']"
      @scroll="handleScroll"
    >
      <div class="grid-row" v-if="groupDataLoaded">
        <!-- run the loop for 7 times, irrespective of number of sources received through API -->

        <div v-for="index in noOfSlotsToRender" :key="index">
          <!-- render AudioSource component only if audioSources[index - 1] have some data and Index of each source is matched with loop index -->
          <!-- Hardcode "balanceVal" so that every source will render as stereo -->
          <AudioSource
            v-if="audioSources[index - 1].Index == index"
            :sourceIndex="audioSources[index - 1].Index"
            :noOfChannels="2"
            :channelGains="audioSources[index - 1].Channels"
            :sourceName="audioSources[index - 1].SourceName"
            :sourceId="audioSources[index - 1].ID"
            :previewId="audioSources[index - 1].PreviewID"
            :master="false"
            :balanceVal="audioSources[index - 1].Balance"
            :rtilCode="audioSources[index - 1].partyCode"
            :pairSelected="audioSources[index - 1].PairSelected"
          />

          <!-- if audioSources[index - 1] is empty, i.e. if its dummy slot -->
          <div v-else>
            <div class="grid-column">
              <div class="column-top">
                <div class="grid">
                  <span class="grey number">{{ index }}</span>
                  <video></video>
                </div>
              </div>
              <div class="vertical-slider">
                <div class="audio-mixer">
                  <p>Source {{ index }}</p>
                  <div class="audio-mixer-box emptySlot">
                    <div class="audio-mixer-repeat">
                      <div class="repeat orange-border-top-filler"></div>
                      <div class="repeat orange-border-top-filler"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import AudioSource from "./AudioSource.vue";
import { mapState } from "vuex";
import { WebRtcClient } from "../webRTC/localClient";
export default {
  components: {
    AudioSource,
  },
  data() {
    return {
      audioSources: [],
      taskid: null,
    };
  },
  computed: {
    ...mapState({
      audioSource: (state) => state.audioSource.audioSourceData.response,
      videoPlayed: (state) => state.audioSource.videoPlayed,
      groupDataLoaded: (state) => state.audioSource.groupDataLoaded,
      SourceDataLoaded: (state) => state.audioSource.SourceDataLoaded,
      isTaskDisabled: (state) => state.audioSource.isTaskDisabled,
      isTaskDeleted: (state) => state.audioSource.isTaskDeleted,
      isLoading: (state) =>
        state.audioSource.audioSourceData.isFechingAudioSourceData,
      agoraMeetingTokenData: (state) => state.audioSource.agoraMeetingTokenData,
    }),
    noOfSlotsToRender() {
      // let noOfSlots = 0;
      // if (this.audioSource.Sources.length < 7) {
      //   noOfSlots = 7;
      // } else if (this.audioSource.Sources.length == 7) {
      //   if (this.audioSource.Sources[6].ID.startsWith("QuadViewSource")) {
      //     noOfSlots = this.audioSource.Sources.length;
      //   } else {
      //     noOfSlots = this.audioSource.Sources.length + 1;
      //   }
      // }
      // return noOfSlots;
      return this.audioSource.Sources.length < 7
        ? 7
        : this.audioSource.Sources.length;
    },
  },
  watch: {
    isTaskDisabled() {
      if (this.isTaskDisabled) {
        this.$alert(
          <div class="error-popup">
            <span class="icon iconfont">&#xe688;</span>
            <div class="error-content">
              <h3>The Program shutted down</h3>
              <p>
                The Program has been shutted down. You can close this page and
                leave.
              </p>
            </div>
          </div>,
          {
            dangerouslyUseHTMLString: true,
            showClose: false,
            showConfirmButton: false,
          }
        );
      }
    },
    isTaskDeleted() {
      if (this.isTaskDeleted) {
        this.$alert(
          <div class="error-popup">
            <span class="icon iconfont">&#xe688;</span>
            <div class="error-content">
              <h3>The Program shutted down</h3>
              <p>
                The Program has been shutted down. You can close this page and
                leave.
              </p>
            </div>
          </div>,
          {
            dangerouslyUseHTMLString: true,
            showClose: false,
            showConfirmButton: false,
          }
        );
      }
    },
    audioSource() {
      // check if RPS sources are enabled,
      // if its enabled we need to show 10 slots on UI instead of 7
      // if (this.audioSource.rps) {
      //   this.noOfSlotsToRender = 10;
      // }

      // create placeholder/dummy data for missing sources
      // clone the main sources object, so that it does not get affected at other places
      this.audioSources = [...this.audioSource.Sources];

      // sort Sources array on the basis of Index property of each source
      this.audioSources.sort((a, b) => {
        return a.Index - b.Index;
      });

      // fill missing source data
      for (let i = 0; i < this.noOfSlotsToRender; i++) {
        if (this.audioSources[i] == undefined) {
          let dummySource = {};
          this.audioSources.splice(i + 1, 0, dummySource);
        }
        if (this.audioSources[i].Index !== i + 1) {
          for (let k = 0; k < this.audioSources[i].Index - (i + 1); i++) {
            let dummySource = {};
            this.audioSources.splice(i + k, 0, dummySource);
          }
        }
      }
      window.console.log("bbbb --> ", this.audioSources);
    },
    videoPlayed() {
      // On page load
      // when video autoplay starts, mute/remove volume meter level for
      // all those channels which are in Mute state
      // this.audioSource.Master.Channels.forEach((element, index) => {
      //   if (element.isMute) {
      //     WebRtcClient.muteOutput(this.audioSource.Master.PreviewID, index);
      //   }
      // });
      // this.audioSource.Sources.forEach((element) => {
      //   element.Channels.forEach((item, index) => {
      //     if (item.isMute) {
      //       WebRtcClient.muteOutput(element.PreviewID, index);
      //     }
      //   });
      // });
    },
    agoraMeetingTokenData() {
      this.initClient();
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
    this.getAudioSource();
    this.openWebSocket();
    //this.getMeetingToken();
    window.console.log(
      "this.audioSources====>>>" + JSON.stringify(this.audioSources)
    );
    // setTimeout(function(){
    //   this.initClient()
    // },200)
    // this.initClient();
  },
  methods: {
    getAudioSource() {
      this.$store.dispatch("audioSource/actionGetAudioSource", this.taskid);
    },
    getAudioGroup() {
      this.$store.dispatch("audioGroup/actionGetAudioGroup", this.taskid);
    },
    openWebSocket() {
      this.$store.dispatch("audioSource/actionOpenWebSocket", this.taskid);
    },
    // getMeetingToken() {
    //   this.$store.dispatch("audioSource/actionGetMeetingToken", this.taskid);
    // },
    initClient() {
      window.console.log("initClient");
      window.console.log(
        "this.agoraMeetingTokenData",
        this.agoraMeetingTokenData
      );
      WebRtcClient.callInitAgora(this.agoraMeetingTokenData);
    },
    handleScroll() {
      const element = document.getElementsByClassName("hr-scroll");
      if (element.scrollLeft !== 0) {
        this.$store.dispatch("audioSource/actionHandleHorizontalScroll", true);
      }
    },
  },
};
</script>