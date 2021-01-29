<template>
  <span>
    <button
      :class="['btn mute jsSolo']"
      @click="toggleSolo()"
      :data-id="previewId"
      :data-channelIndex="channelIndex"
    >
      Solo
    </button></span
  >
</template>
<script>
import { WebRtcClient } from "../webRTC/localClient";
import { mapGetters } from "vuex";
export default {
  props: {
    previewId: {
      type: String,
    },
    channelIndex: {
      type: Number,
    },
  },
  data() {
    return {
      isActiveSolo: false,
    };
  },
  mounted() {
    this.unSoloArray.forEach((element) => {
      this.isActiveSolo = element.isSoloActive;
    });
  },
  computed: {
    ...mapGetters({
      unSoloArray: "audioSource/getUnSoloArray",
      soloArray: "audioSource/getSoloArray",
      audioSources: "audioSource/channelList",
    }),
  },
  methods: {
    toggleSolo() {
      this.isActiveSolo = !this.isActiveSolo;
      var soloElements = document.getElementsByClassName("jsSolo");
      if (this.isActiveSolo) {
        // dispatch only that solo button data which is clicked, to vuex
        let previewId = this.previewId;
        let channelIndex = this.channelIndex;
        let soloData = { previewId, channelIndex, isActiveSolo: true };
        this.$store.dispatch("audioSource/actionSetSoloArray", soloData);

        // Now, as we have updated soloArray and unSoloArray which is set in vuex
        // mute all sources/channels which is avaialable in unSoloArray

        for (var i = 0; i < soloElements.length; i++) {
          let dataId = soloElements[i].getAttribute("data-id");
          let channelindex = soloElements[i].getAttribute("data-channelindex");
          soloElements[i].classList.remove("follow");
          soloElements[i].classList.add("mute");
          if (dataId == this.previewId && channelindex == this.channelIndex) {
            soloElements[i].classList.remove("mute");
            soloElements[i].classList.add("follow");
          }
        }

        this.unSoloArray.forEach((element) => {
          WebRtcClient.muteAudio(element.pID, element.channelIndex);
        });

        // unmute all sources/channels which is avaialable in soloArray
        this.soloArray.forEach((element) => {
          WebRtcClient.unMuteAudio(element.pID, element.channelIndex);
        });

        // prepare audiosources data with solo = true, for each active solo channel
        // this.audioSources.Sources.forEach((element) => {
        //   if (previewId == element.PreviewID) {
        //     element.Channels[channelIndex].isSolo = true;
        //   }
        // });
      } else {
        for (var k = 0; k < soloElements.length; k++) {
          let dataId = soloElements[k].getAttribute("data-id");
          let channelindex = soloElements[k].getAttribute("data-channelindex");
          // soloElements[k].classList.remove("mute");
          // soloElements[k].classList.add("follow");
          if (
            dataId == this.previewId &&
            channelindex == this.channelIndex &&
            soloElements[k].classList.contains("mute")
          ) {
            soloElements[k].classList.remove("mute");
            soloElements[k].classList.add("follow");
          } else {
            soloElements[k].classList.remove("follow");
            soloElements[k].classList.add("mute");
          }
        }
        // dispatch only that solo button data which is clicked, to vuex
        let previewId = this.previewId;
        let channelIndex = this.channelIndex;
        let unSoloData = { previewId, channelIndex, isActiveSolo: false };
        this.$store.dispatch("audioSource/actionSetUnSoloArray", unSoloData);

        // Now, as we have updated soloArray and unSoloArray which is set in vuex
        // Check if solo array is not empty
        if (this.soloArray.length) {
          // mute all sources/channels which is avaialable in unSoloArray
          this.unSoloArray.forEach((element) => {
            WebRtcClient.muteAudio(element.pID, element.channelIndex);
          });

          // unmute all sources/channels which is avaialable in soloArray
          this.soloArray.forEach((element) => {
            WebRtcClient.unMuteAudio(element.pID, element.channelIndex);
          });
        } else {
          // if solo array is empty, we need to unmute all sources/channels
          this.unSoloArray.forEach((element) => {
            WebRtcClient.unMuteAudio(element.pID, element.channelIndex);
          });
        }

        // prepare audiosources data with solo = false, for each inactive solo channel
        // this.audioSources.Sources.forEach((element) => {
        //   if (previewId == element.PreviewID) {
        //     element.Channels[channelIndex].isSolo = false;
        //   }
        // });
      }
    },
  },
};
</script>
