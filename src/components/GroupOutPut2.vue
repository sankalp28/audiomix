<template>
  <div class="audio-mixer">
    <p>{{ this.mixerName }}</p>
    <div class="audio-mixer-box">
      <div class="btn-sec on-off">
        <span>
          <button
            :class="onButtonClass()"
            v-on="
              (this.audioGroupData.Groups[1].ChannelIds.length ||
                isGroupEnabled) &&
              !this.afvEnabled()
                ? { click: handleToggleGroupEnable }
                : null
            "
            :disabled="onButtonDisabled"
          >
            ON
          </button></span
        >
      </div>
      <Headphone :groupNumber="2" />
      <div class="slider">
        <div class="range-slide">
          <div class="range-box">
            <div class="slider-vert">
              <div class="slider-large">
                <el-slider
                  v-model="gainValue"
                  :disabled="
                    !isGroupEnabled || (isGroupEnabled && this.afvEnabled())
                  "
                  vertical
                  :show-tooltip="false"
                  height="440px"
                  :marks="marks"
                  :max="299"
                  :min="0"
                  @input="handleGaincrementValuehange()"
                ></el-slider>
              </div>
              <div class="slider-large2">
                <vu-meter
                  :val="gainVal0"
                  :height="440"
                  :width="4"
                  :newVolumePercentage="newVolume0"
                ></vu-meter>
                <vu-meter
                  style="margin-left='2px'"
                  :val="gainVal1"
                  :height="440"
                  :width="4"
                  :newVolumePercentage="newVolume1"
                ></vu-meter>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="btn-sec">
        <div class="muteIcon">
          <span
            v-if="!isActiveMute"
            class="icon iconfont"
            v-on="
              isGroupEnabled && !this.afvEnabled()
                ? { click: toggleMute }
                : null
            "
            >&#xe61d;</span
          >
          <span
            v-else
            class="icon iconfont disabled"
            v-on="
              isGroupEnabled && !this.afvEnabled()
                ? { click: toggleMute }
                : null
            "
            >&#xe69d;</span
          >
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import VuMeter from "./VuMeter.vue";
import Headphone from "./Headphone.vue";
import { mapGetters, mapState } from "vuex";
import { WebRtcClient } from "../webRTC/localClient";
import _ from "lodash";
import common from "../mixins/common";

export default {
  components: {
    "vu-meter": VuMeter,
    Headphone,
  },
  mixins: [common],
  props: {
    mixerName: {
      type: String,
    },
    gain: {
      type: Number,
    },
    channel: {
      type: Array,
    },
    isMute: {
      type: Boolean,
    },
  },
  data() {
    return {
      isActiveMute: false,
      gainValue: 0,
      faderValue: 0,
      marks: {
        "299": "+12",
        "269": "+6",
        "239": "0",
        "209": "-6",
        "179": "-12",
        "149": "-18",
        "119": "-24",
        "89": "-30",
        "0": "-∞",
      },
      gainVal0: 0,
      gainVal1: 0,
      newVolume0: 0,
      newVolume1: 0,
      isGroupEnabled: false,
      onButtonDisabled: true,
    };
  },
  mounted() {
    this.isGroupEnabled = this.audioGroupData.Groups[1].isEnabled;
    this.isActiveMute = this.audioGroupData.Groups[1].isMute;
    this.gainValue = this.gain;
  },
  computed: {
    ...mapState({
      volumeForGroups: (state) => state.audioSource.volumeForGroup2,
      audioGroupData: (state) => state.audioSource.audioGroupData.response,
      audioSourceData: (state) => state.audioSource.audioSourceData.response,
    }),
    ...mapGetters({
      channelList: "audioSource/channelList",
      dataForGroup2: "audioGroup/getDataForGroup2",
      calculatedGainForGroup2: "audioGroup/getCalculatedGainForGroup2",
      calculatedGainForGroup1: "audioGroup/getCalculatedGainForGroup1",
      audioSources: "audioSource/channelList",
    }),
  },
  watch: {
    volumeForGroups() {
      if (this.isGroupEnabled && !this.afvEnabled()) {
        this.gainVal0 = this.volumeForGroups.value[0];
        this.gainVal1 = this.volumeForGroups.value[1];
        this.newVolume0 = this.volumeForGroups.newVolumeValue[0];
        this.newVolume1 = this.volumeForGroups.newVolumeValue[1];
      } else {
        this.gainVal0 = 0;
        this.gainVal1 = 0;
      }
    },
    audioGroupData() {
      this.isGroupEnabled = this.audioGroupData.Groups[1].isEnabled;
      this.isActiveMute = this.audioGroupData.Groups[1].isMute;
      this.gainValue = this.gain;
    },
  },
  methods: {
    onButtonClass() {
      if (
        this.audioGroupData.Groups[1].ChannelIds.length &&
        this.isGroupEnabled &&
        !this.afvEnabled()
      ) {
        this.onButtonDisabled = false;
        return "btn muteButton orange";
      } else if (this.audioGroupData.Groups[1].ChannelIds.length) {
        this.onButtonDisabled = false;
        return "btn muteButton mute";
      } else {
        this.onButtonDisabled = true;
        return "btn muteButton mute";
      }
    },
    afvEnabled() {
      return this.audioSourceData.AFV;
    },
    handleToggleGroupEnable() {
      this.isGroupEnabled = !this.isGroupEnabled;
      this.audioGroupData.Groups[1].isEnabled = this.isGroupEnabled;
      // if (!this.isGroupEnabled) {
      //   this.audioGroupData.Groups[1].isMute = this.isGroupEnabled;
      //   this.isActiveMute = this.isGroupEnabled;
      // }
      this.setDataInGroupsAPIWithoutCommit(this.audioGroupData);
    },
    handleGaincrementValuehange: _.throttle(function() {
      let self = this;
      this.audioGroupData.Groups[1].Gain = this.gainValue;
      WebRtcClient.setGroupData(this.audioGroupData.Groups[1], 2);

      this.audioGroupData.Groups[1].ChannelIds.map((element) => {
        let channelId = element.split("-");
        let previewID = channelId[0];
        let channelIndex = channelId[1];
        let source = self.audioSourceData.Sources.filter((item) => {
          return previewID == item.ID;
        });
        if (source[0].Balance > -1) {
          WebRtcClient.changeGainLeft(source[0].PreviewID, true);
          WebRtcClient.changeGainRight(source[0].PreviewID, true);
        } else {
          if (channelIndex == 0) {
            WebRtcClient.changeGainLeft(source[0].PreviewID, true);
          }
          if (channelIndex == 1) {
            WebRtcClient.changeGainRight(source[0].PreviewID, true);
          }
        }
      });
      this.setDataInGroupsAPIWithoutCommit(this.audioGroupData);
    }, 100),
    toggleMute() {
      // toggle button state
      this.isActiveMute = !this.isActiveMute;

      // apply mute state on the basis of toggled state
      this.audioGroupData.Groups[1].isMute = this.isActiveMute;

      // send updated group data to API
      this.setDataInGroupsAPIWithoutCommit(this.audioGroupData);

      // check if group is muted, if yes apply group gain as 0 or apply group gain as it is
      // if (this.audioGroupData.Groups[1].isMute) {
      //   this.audioGroupData.Groups[1].Gain = 0;
      // } else {
      //   this.audioGroupData.Groups[1].Gain = this.gainValue;
      // }
      let self = this;
      this.audioGroupData.Groups[1].ChannelIds.map((element) => {
        let channelId = element.split("-");
        let previewID = channelId[0];
        let channelIndex = channelId[1];
        let source = self.audioSources.Sources.filter((item) => {
          return previewID == item.ID;
        });
        // mute/unmute all sources which are added to group 2
        self.audioSources.Sources.map((element) => {
          if (element.PreviewID == source[0].PreviewID) {
            if (element.Balance > -1) {
              element.Channels[0].isMute = self.isActiveMute;
              element.Channels[1].isMute = self.isActiveMute;
            } else {
              element.Channels[channelIndex].isMute = self.isActiveMute;
            }
          }
        });
        this.$store.dispatch(
          "audioSource/actionUpdateAudioSourcesByGainValue",
          this.audioSources
        );
        // send updated source data to API
        this.$store.dispatch(
          "audioSource/actionSetGainValue",
          self.audioSources
        );

        WebRtcClient.setGroupData(self.audioGroupData.Groups[0], 0);
        if (channelIndex == 0) {
          WebRtcClient.changeGainLeft(source[0].PreviewID);
        }
        if (channelIndex == 1) {
          WebRtcClient.changeGainRight(source[0].PreviewID);
        }
      });
    },
  },
};
</script>
