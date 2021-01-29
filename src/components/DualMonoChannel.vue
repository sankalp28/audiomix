<template>
  <div>
    <div
      :class="[
        'repeat',
        gain[index].Output ? 'orange-border-top' : 'orange-border-top-filler',
      ]"
      v-for="(c, index) in channelsToRepeat"
      :key="index"
    >
      <LeftRightButton
        :previewId="previewId"
        :channelIndex="index"
        :isMute="gain[index].isMute"
        :isSolo="gain[index].isSolo"
        :isOutput="gain[index].Output"
        :isOutputDisabled="gain[index].OutputDisabled"
      />
      <Headphone
        :previewId="previewId"
        :channelIndex="index"
        :sourceId="sourceId"
        :isMute="!gain[index].isMute"
      />
      <div class="slider">
        <div class="range-slide">
          <div class="range-box">
            <GroupButtons
              :active1="isActive(sourceId, index, 0)"
              :active2="isActive(sourceId, index, 1)"
              :sourceId="sourceId"
              :index="index"
              :previewId="previewId"
              :isMute="gain[index].isMute"
              @updateGroup="updateGroup"
            />
            <LeftRightControl
              :previewId="previewId"
              :channelIndex="index"
              :panValue="gain[index].Pan"
            />
            <div class="slider-vert">
              <div class="slider-large">
                <el-slider
                  v-model="gainValue[index]"
                  vertical
                  :show-tooltip="false"
                  height="440px"
                  :marks="marks"
                  :max="299"
                  :min="0"
                  @input="handleGainIncrementValueChange(index)"
                ></el-slider>
              </div>
              <div class="slider-large2">
                <vu-meter
                  :val="index == 0 ? gainVal0 : gainVal1"
                  :height="440"
                  :width="4"
                  :previewId="previewId"
                  :channelIndex="index"
                  :newVolumePercentage="index == 0 ? newVolume0 : newVolume1"
                ></vu-meter>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ChannelActionButtons
        :previewId="previewId"
        :channelIndex="index"
        :isMute="gain[index].isMute"
        :isSolo="gain[index].isSolo"
        :isOutput="gain[index].Output"
      />
    </div>
  </div>
</template>
<script>
import VuMeter from "./VuMeter.vue";
import GroupButtons from "./GroupButtons.vue";
import LeftRightControl from "./LeftRightControl.vue";
import ChannelActionButtons from "./ChannelActionButtons.vue";
import Headphone from "./Headphone.vue";
import LeftRightButton from "./LeftRightButton.vue";
import { mapState } from "vuex";
import { WebRtcClient } from "../webRTC/localClient";
import _ from "lodash";
export default {
  components: {
    "vu-meter": VuMeter,
    GroupButtons,
    LeftRightControl,
    ChannelActionButtons,
    Headphone,
    LeftRightButton,
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
      faderDifference: 0,
      peakValue: [],
      gainValue: [],
      marks: {
        299: "+12",
        269: "+6",
        239: "0",
        209: "-6",
        179: "-12",
        149: "-18",
        119: "-24",
        89: "-30",
        0: "-∞",
      },
      gainVal0: 0,
      gainVal1: 0,
      newVolume0: 0,
      newVolume1: 0,
    };
  },
  created() {
    this.gain.forEach((element) => {
      this.gainValue.push(element.Gain);
    });
  },
  computed: {
    ...mapState({
      volume: (state) => state.audioSource.volume,
      audioGroups: (state) => state.audioSource.audioGroupData.response,
      audioSources: (state) => state.audioSource.audioSourceData.response,
      group1Gain: (state) =>
        state.audioSource.audioGroupData.response.Groups[0].Gain,
      group2Gain: (state) =>
        state.audioSource.audioGroupData.response.Groups[1].Gain,
    }),
  },
  watch: {
    volume() {
      if (this.previewId === this.volume.previewId) {
        this.gainVal0 = this.volume.value[0];
        this.gainVal1 = this.volume.value[1];
        this.newVolume0 = this.volume.newVolumeValue[0];
        this.newVolume1 = this.volume.newVolumeValue[1];
      }
    },
    group1Gain(newVal, oldVal) {
      let previewId = null;
      let channelIndex = null;
      let self = this;
      this.audioGroups.Groups[0].ChannelIds.map((element) => {
        // find source id, channel index and preview id from sources which are added into either Groups
        let channelId = element.split("-");
        let sourceID = channelId[0];
        channelIndex = channelId[1];
        let selectedSource = self.audioSources.Sources.filter((item) => {
          return item.ID == sourceID;
        });
        previewId = selectedSource[0].PreviewID;
        if (self.previewId == previewId) {
          if (channelIndex == 0) {
            if (self.gainValue[0] !== self.gainValue[1]) {
              let difference = newVal - oldVal;
              this.$set(this.gainValue, 0, difference + self.gainValue[0]);
            } else {
              this.$set(this.gainValue, 0, self.group1Gain);
            }
          } else {
            if (self.gainValue[1] !== self.gainValue[0]) {
              let difference = newVal - oldVal;
              this.$set(this.gainValue, 1, difference + self.gainValue[1]);
            } else {
              this.$set(this.gainValue, 1, self.group1Gain);
            }
          }
        }
      });
    },
    group2Gain(newVal, oldVal) {
      let previewId = null;
      let channelIndex = null;
      let self = this;
      this.audioGroups.Groups[1].ChannelIds.map((element) => {
        // find source id, channel index and preview id from sources which are added into either Groups
        let channelId = element.split("-");
        let sourceID = channelId[0];
        channelIndex = channelId[1];
        let selectedSource = self.audioSources.Sources.filter((item) => {
          return item.ID == sourceID;
        });
        previewId = selectedSource[0].PreviewID;
        if (self.previewId == previewId) {
          if (channelIndex == 0) {
            if (self.gainValue[0] !== self.group2Gain) {
              let difference = newVal - oldVal;
              this.$set(this.gainValue, 0, difference + self.gainValue[0]);
            } else {
              this.$set(this.gainValue, 0, self.group2Gain);
            }
          } else {
            if (self.gainValue[1] !== self.group2Gain) {
              let difference = newVal - oldVal;
              this.$set(this.gainValue, 1, difference + self.gainValue[1]);
            } else {
              this.$set(this.gainValue, 1, self.group2Gain);
            }
          }
        }
      });
    },
  },
  methods: {
    updateGroup(_input) {
      if (_input.isActive == true) {
        let data = _input.sourceId + "-" + _input.channelId;
        let index = this.audioGroups.Groups[
          _input.channelId
        ].ChannelIds.indexOf(data);
        if (index < 0) {
          this.audioGroups.Groups[_input.channelId].ChannelIds.push(data);
        }
      } else {
        let data = _input.sourceId + "-" + _input.channelId;
        let index = this.audioGroups.Groups[
          _input.channelId
        ].ChannelIds.indexOf(data);
        if (index >= 0) {
          this.audioGroups.Groups[_input.channelId].ChannelIds.splice(index, 1);
        }
      }
    },
    isActive(_sourceId, _index, _groupIndex) {
      let flag = false;
      let data = [];

      if (this.audioGroups && this.audioGroups.Groups) {
        let group = this.audioGroups.Groups[_groupIndex];
        let ChannelIds = group.ChannelIds;
        let combine = this.sourceId + "-" + _index;
        data = ChannelIds.filter((item) => {
          return item == combine;
        });
      }
      flag = data.length ? true : false;
      return flag;
    },
    handleGainIncrementValueChange: _.throttle(function (channelID) {
      const self = this;
      const channelIDPassed = channelID;
      for (let property in this.audioSources) {
        if (property == "Sources") {
          this.audioSources.Sources.map((item) => {
            if (item.ID == self.sourceId) {
              item.Channels.map((item, index) => {
                item.Gain = self.gainValue[index];
                let previewID = self.previewId;
                let channelID = channelIDPassed;
                if (channelID == index) {
                  let gainValue = self.gainValue[index];
                  self.$store.dispatch(
                    "audioSource/actionSetGainValueForLocal",
                    {
                      gainValue,
                      previewID,
                      channelID,
                    }
                  );
                  WebRtcClient.setChannelSources(
                    self.previewId,
                    channelID,
                    item
                  );
                }
              });
            }
          });
        }
      }
      this.$store.dispatch(
        "audioSource/actionUpdateAudioSourcesByGainValue",
        this.audioSources
      );
      this.$store.dispatch("audioSource/actionSetGainValue", this.audioSources);
    }, 100),
  },
};
</script>
