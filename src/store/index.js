import Vue from "vue";
import Vuex from "vuex";
import audioSource from "./modules/audioSource.module";
import audioGroup from "./modules/audioGroup.module";


Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    audioSource,
    audioGroup
  },
});
