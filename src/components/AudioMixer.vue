<template>
  <div class="mid-right-section">
    <MainInput />
  </div>
</template>
<script>
import MainInput from "./MainInput.vue";
//import { mapState } from "vuex";
export default {
  components: {
    MainInput,
  },
  data() {
    return {
      taskid: null,
    };
  },
  mounted() {
    let path = window.location.pathname.split("/");
    if (path.length == 3) {
      this.taskid = path[2];
    }
    if (path.length == 2) {
      this.taskid = path[1];
    }
  },
};
</script>
