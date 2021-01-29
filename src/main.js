import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import ElementUI from "element-ui";
import locale from "element-ui/lib/locale/lang/en";
import VueIconFont from "vue-icon-font";

// Importing the global css file
import "@/assets/style.css";
import "@/assets/element-ui.css";
import "element-theme-dark";
import "@/assets/iconfonts/iconfont.css";
import "@/assets/iconfonts/iconfont.js";

Vue.config.productionTip = false;

Vue.use(ElementUI, { locale });

Vue.use(VueIconFont);

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
