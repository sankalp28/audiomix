<template>
  <div class="slider-hrz">
    <veeno
      v-if="channelIndex == 0 && sourceType !== 'stereo'"
      v-model="sliderVal"
      :handles="[this.panValueLocalLeft]"
      :connect="[true, true]"
      :range="{
        min: 0,
        max: 1,
      }"
      @slide="
        updateSliderLeft();
        updateSliderChange();
      "
      ref="slider"
    />
    <veeno
      v-else-if="channelIndex == 0 && sourceType == 'stereo'"
      v-model="sliderVal"
      :handles="[this.panValueLocalLeft]"
      :connect="[true, true]"
      :range="{
        min: -1,
        max: 1,
      }"
      @slide="
        updateSliderLeft();
        updateSliderChange();
      "
      ref="slider"
    />
    <veeno
      v-else
      v-model="sliderVal"
      :handles="[this.panValueLocalRight]"
      :connect="[true, true]"
      :range="{
        min: -1,
        max: 0,
      }"
      @slide="
        updateSliderRight();
        updateSliderChange();
      "
      ref="slider"
    />
    <span class="fl">L</span>
    <span class="fr">R</span>
  </div>
</template>
<script>
import veeno from "veeno";
import "nouislider/distribute/nouislider.min.css";
import { WebRtcClient } from "../webRTC/localClient";
import { mapGetters } from "vuex";
import common from "../mixins/common";
import _ from "lodash";
export default {
  mixins: [common],
  components: {
    veeno,
  },
  props: {
    previewId: {
      type: String,
    },
    channelIndex: {
      type: Number,
    },
    panValue: {
      type: Number,
    },
    sourceType: {
      type: String,
    },
  },
  data() {
    return {
      sliderVal: 0,
      panValueLocalLeft1: this.panValueLocalLeft,
      panValueLocalRight1: this.panValueLocalRight,
    };
  },
  mounted() {
    this.addFakeFills();
  },
  computed: {
    ...mapGetters({
      audioSources: "audioSource/channelList",
    }),
    panValueLocalLeft() {
      return 0; // hardcoded as Pan is soming as 50 for both channels, earlier it was 0 and 100
      // return this.scaleConversion(this.panValue, 0, 100, 0, 1);
    },
    panValueLocalRight() {
      return this.scaleConversion(this.panValue, 0, 100, -1, 0);
    },
  },
  methods: {
    addFakeFills() {
      var connectionWrapper = this.$refs.slider.$el.querySelectorAll(
        ".noUi-connects"
      );
      var connections = this.$refs.slider.$el.querySelectorAll(".noUi-connect");
      let range = document.createElement("div");
      range.classList.add("range");
      connections[0].style.zIndex = 4;
      connections[1].style.zIndex = 2;
      connections.forEach(() => {
        let node = document.createElement("div");
        node.classList.add("fake-fill");
        connectionWrapper[0].appendChild(node);
      });
      connectionWrapper[0].appendChild(range);
      var fakeFills = this.$refs.slider.$el.querySelectorAll(".fake-fill");

      fakeFills[0].style.left = 0;
      fakeFills[1].style.right = 0;
      if (this.panValue <= 50) {
        fakeFills[0].style.zIndex = 3;
        fakeFills[1].style.zIndex = 1;
      } else {
        connections[0].style.zIndex = 2;
        connections[1].style.zIndex = 4;
        fakeFills[0].style.zIndex = 1;
        fakeFills[1].style.zIndex = 2;
      }
    },
    updateSliderChange: _.throttle(function() {
      let currentVal = this.sliderVal;
      let channelIndx = this.channelIndex;
      let previewID = this.previewId;
      let self = this;
      for (let property1 in this.audioSources) {
        if (property1 == "Sources") {
          this.audioSources.Sources.map((element) => {
            if (element.PreviewID == previewID) {
              element.Channels.map((item, index) => {
                let scaledValue = null;

                // check if source is stereo
                if (self.sourceType == "stereo") {
                  // if source is stereo
                  if (index == 1) {
                    // check the direction of slider movement
                    if (currentVal < 0 && currentVal >= -1) {
                      // slider is moving to left (between center and left)
                      element.Channels[0].Pan = 0; // reset left channel Pan value and apply the Pan to right channel only
                      scaledValue = this.scaleConversion(
                        currentVal,
                        -1,
                        0,
                        0,
                        100
                      );
                      item.Pan = Math.floor(scaledValue);
                    }
                  } else {
                    if (currentVal > 0 && currentVal <= 1) {
                      // slider is moving to right (between center and right)
                      element.Channels[1].Pan = 100; // reset right channel Pan value and apply the Pan to left channel only
                      scaledValue = this.scaleConversion(
                        currentVal,
                        0,
                        1,
                        0,
                        100
                      );
                      item.Pan = Math.floor(scaledValue);
                    }
                  }
                } else {
                  // if source is not stereo
                  if (channelIndx == index) {
                    if (channelIndx == 0) {
                      scaledValue = this.scaleConversion(
                        currentVal,
                        0,
                        1,
                        0,
                        100
                      );
                      item.Pan = Math.floor(scaledValue);
                    } else {
                      scaledValue = this.scaleConversion(
                        currentVal,
                        -1,
                        0,
                        0,
                        100
                      );
                      item.Pan = Math.floor(scaledValue);
                    }

                    WebRtcClient.setChannelSources(
                      self.previewId,
                      self.channelIndex,
                      item
                    );
                  }
                }
              });
            }
          });
        }
      }
      this.$store.dispatch(
        "audioSource/actionSetPanValueLevel",
        this.audioSources
      );
    }, 100),
    updateSliderLeft() {
      let currentVal = this.sliderVal;
      if (currentVal > 0 && currentVal <= 0.5) {
        this.updateStyles("movingRightUptoCenter");
      }
      if (currentVal > 0.5 && currentVal <= 1) {
        this.updateStyles("movingRightFromCenter");
      }
      if (this.sourceType == "stereo") {
        WebRtcClient.changePan(this.previewId, currentVal, 0, this.sourceType);
      } else {
        WebRtcClient.changePan(this.previewId, currentVal, 0);
      }
    },
    updateSliderRight() {
      let currentVal = this.sliderVal;
      if (currentVal < 0 && currentVal <= -0.5) {
        this.updateStyles("movingLeftUptoCenter");
      }
      if (currentVal > -0.5 && currentVal >= -1) {
        this.updateStyles("movingLeftFromCenter");
      }
      WebRtcClient.changePan(this.previewId, currentVal, 1);
    },
    updateStyles(type) {
      var connections = this.$refs.slider.$el.querySelectorAll(".noUi-connect");
      var fakeFills = this.$refs.slider.$el.querySelectorAll(".fake-fill");
      switch (type) {
        case "movingRightUptoCenter":
          connections[0].style.zIndex = 4;
          connections[1].style.zIndex = 1;
          fakeFills[0].style.zIndex = 3;
          fakeFills[1].style.zIndex = 0;
          break;
        case "movingRightFromCenter":
          connections[0].style.zIndex = 1;
          connections[1].style.zIndex = 4;
          fakeFills[0].style.zIndex = 0;
          fakeFills[1].style.zIndex = 3;
          break;
        case "movingLeftUptoCenter":
          connections[0].style.zIndex = 4;
          connections[1].style.zIndex = 1;
          fakeFills[0].style.zIndex = 3;
          fakeFills[1].style.zIndex = 0;
          break;
        case "movingLeftFromCenter":
          connections[0].style.zIndex = 1;
          connections[1].style.zIndex = 4;
          fakeFills[0].style.zIndex = 0;
          fakeFills[1].style.zIndex = 3;
          break;
      }
    },
  },
};
</script>
<style>
.noUi-target {
  width: 90%;
  background: transparent;
  border: none;
  box-shadow: none;
  border-radius: 0;
}
.noUi-connects {
  border-radius: 0;
}
.noUi-connect {
  max-width: 100% !important;
  background: #3f3d38;
}
.noUi-horizontal {
  height: 0.29296875vw;
}
.noUi-horizontal .noUi-handle {
  width: 10px;
  height: 10px;
  top: -3px;
  background: #1fbcd2;
  border-radius: 10px;
  border: none;
  box-shadow: none;
  cursor: pointer;
  outline: none;
}
.noUi-horizontal .noUi-handle:before,
.noUi-horizontal .noUi-handle:after {
  content: "";
  background: transparent;
}
html:not([dir="rtl"]) .noUi-horizontal .noUi-handle {
  right: -5px;
  left: auto;
}
.fake-fill {
  position: absolute;
  top: 0;
  width: 50%;
  height: 100%;
  z-index: 1;
  background: #33ab4f;
}
.range {
  position: absolute;
  margin: auto;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 3px;
  height: 100%;
  background: white;
  z-index: 5;
}
</style>
