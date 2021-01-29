<template>
  <div class="audio-mixer-box orange-border-top">
    <Headphone />
    <div class="slider">
      <div class="range-slide">
        <div class="range-box">
          <GroupButtons />
          <LeftRightControl
            :previewId="previewId"
            :channelIndex="index"
            :panValue="gain[index].PanValue"
          />
          <div class="slider-vert">
            <div class="slider-large">
              <el-slider
                v-model="gainValue"
                vertical
                :show-tooltip="true"
                height="440px"
                :marks="marks"
                :min="-36"
                :max="4"
                @change="handleGaincrementValuehange"
              ></el-slider>
            </div>
            <div class="slider-large2">
              <vu-meter
                :val="peakValue"
                :height="440"
                :width="4"
                :remoteKey="previewId"
              ></vu-meter>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ChannelActionButtons
      :previewId="previewId"
      :channelIndex="index"
      :isActiveMute="gain[index].isMute"
    />
  </div>
</template>
<script>
import VuMeter from "./VuMeter.vue";
import GroupButtons from "./GroupButtons.vue";
import LeftRightControl from "./LeftRightControl.vue";
import ChannelActionButtons from "./ChannelActionButtons.vue";
import Headphone from "./Headphone.vue";
import { mapGetters, mapState } from "vuex";
export default {
  components: {
    "vu-meter": VuMeter,
    GroupButtons,
    LeftRightControl,
    ChannelActionButtons,
    Headphone,
  },
  props: {
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
  },
  data() {
    return {
      peakValue: 0,
      gainValue: 0,
      marks: {
        4: "+4",
        0: "0",
        "-6": "-6",
        "-12": "-12",
        "-18": "-18",
        "-36": "-36",
      },
    };
  },
  created() {
    this.gain.forEach((element) => {
      this.gainValue = element.Gain;
    });
  },
  computed: {
    ...mapGetters({ audioSources: "audioSource/channelList" }),
    ...mapState({
      volume: (state) => state.audioSource.volume,
    }),
  },
  watch: {
    volume() {
      if (this.previewId === this.volume.previewId)
        this.peakValue = this.volume.value;
    },
  },
  methods: {
    handleGaincrementValuehange() {
      const self = this;
      for (let property in this.audioSources) {
        this.audioSources[property].map((item) => {
          if (item.ID == self.sourceId) {
            item.channels.map((item) => (item.Gain = self.gainValue));
          }
        });
      }
      this.$store.dispatch("audioSource/actionSetGainValue", this.audioSources);
    },
  },
};
</script>
