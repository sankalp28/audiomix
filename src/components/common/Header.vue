<template>
  <header>
    <div class="header-left">
      <span class="grid"><span class="icon iconfont">&#xe69e;</span></span
      ><span class="logo"
        ><img
          :src="require('@/assets/images/tuv-logo.png')"
          title="TUV logo v2.3.1"
        />
        <strong style="margin-right: 10px">TVU</strong>Audio mixer
      </span>
      <div class="header-select" v-if="advanceMix">
        <el-select
          v-model="pairValue"
          placeholder="Select"
          @change="updateDataOnPairSelect"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </div>
    </div>
  </header>
</template>
<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      options: [
        {
          value: 1,
          label: "Pair 1",
        },
        {
          value: 2,
          label: "Pair 2",
        },
        {
          value: 3,
          label: "Pair 3",
        },
        {
          value: 4,
          label: "Pair 4",
        },
      ],
      pairValue: 1,
      advanceMix: false,
    };
  },
  computed: {
    ...mapState({
      audioSource: (state) => state.audioSource.audioSourceData.response,
    }),
  },
  watch: {
    audioSource() {
      this.advanceMix = this.audioSource.AdvanceMIX;
    },
  },
  methods: {
    updateDataOnPairSelect() {
      this.$store.dispatch(
        "audioSource/actionSetSelectedPairValueForPGM",
        this.pairValue
      );
      // let self = this;
      // let selectedPairValue1ForSource = 0;
      // let selectedPairValue2ForSource = 1;
      // switch (this.pairValue) {
      //   case 1:
      //     selectedPairValue1ForSource = 0;
      //     selectedPairValue2ForSource = 1;
      //     break;
      //   case 2:
      //     selectedPairValue1ForSource = 2;
      //     selectedPairValue2ForSource = 3;
      //     break;
      //   case 3:
      //     selectedPairValue1ForSource = 4;
      //     selectedPairValue2ForSource = 5;
      //     break;
      //   case 4:
      //     selectedPairValue1ForSource = 6;
      //     selectedPairValue2ForSource = 7;
      //     break;
      //   default:
      //     break;
      // }
      // this.audioSources.Sources.map((item) => {
      //   if (item.PreviewID == self.previewId) {
      //     item.PairSelected = this.pairValue;
      //     item.Channels.forEach((element, index) => {
      //       if (index == selectedPairValue1ForSource) {
      //         if (self.selectedPairValueForPGM == 1) {
      //           element.AdvancePan.forEach((panValue, index) => {
      //             if (index === 0) {
      //               self.$set(element.AdvancePan, index, 100);
      //             } else {
      //               self.$set(element.AdvancePan, index, 0);
      //             }
      //           });
      //         } else if (self.selectedPairValueForPGM == 2) {
      //           element.AdvancePan.forEach((panValue, index) => {
      //             if (index === 2) {
      //               self.$set(element.AdvancePan, index, 100);
      //             } else {
      //               self.$set(element.AdvancePan, index, 0);
      //             }
      //           });
      //         } else if (self.selectedPairValueForPGM == 3) {
      //           element.AdvancePan.forEach((panValue, index) => {
      //             if (index === 4) {
      //               self.$set(element.AdvancePan, index, 100);
      //             } else {
      //               self.$set(element.AdvancePan, index, 0);
      //             }
      //           });
      //         } else if (self.selectedPairValueForPGM == 4) {
      //           element.AdvancePan.forEach((panValue, index) => {
      //             if (index === 6) {
      //               self.$set(element.AdvancePan, index, 100);
      //             } else {
      //               self.$set(element.AdvancePan, index, 0);
      //             }
      //           });
      //         }
      //       }
      //       if (index == selectedPairValue2ForSource) {
      //         if (self.selectedPairValueForPGM == 1) {
      //           element.AdvancePan.forEach((panValue, index) => {
      //             if (index === 1) {
      //               self.$set(element.AdvancePan, index, 100);
      //             } else {
      //               self.$set(element.AdvancePan, index, 0);
      //             }
      //           });
      //         } else if (self.selectedPairValueForPGM == 2) {
      //           element.AdvancePan.forEach((panValue, index) => {
      //             if (index === 3) {
      //               self.$set(element.AdvancePan, index, 100);
      //             } else {
      //               self.$set(element.AdvancePan, index, 0);
      //             }
      //           });
      //         } else if (self.selectedPairValueForPGM == 3) {
      //           element.AdvancePan.forEach((panValue, index) => {
      //             if (index === 5) {
      //               self.$set(element.AdvancePan, index, 100);
      //             } else {
      //               self.$set(element.AdvancePan, index, 0);
      //             }
      //           });
      //         } else if (self.selectedPairValueForPGM == 4) {
      //           element.AdvancePan.forEach((panValue, index) => {
      //             if (index === 7) {
      //               self.$set(element.AdvancePan, index, 100);
      //             } else {
      //               self.$set(element.AdvancePan, index, 0);
      //             }
      //           });
      //         }
      //       }
      //     });
      //   }
      // });
      // window.console.log("data sent --> ", this.audioSources);
      // this.$store.dispatch("audioSource/actionSetGainValue", this.audioSources);
    },
  },
};
</script>
