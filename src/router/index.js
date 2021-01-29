import Vue from 'vue'
import VueRouter from 'vue-router'
import Header from '../components/common/Header.vue'
import AudioMixPanel from '../views/AudioMixPanel.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/:taskid',
    // alias: '/taskid',
    name: 'AudioMixPanel',
    components: {
      default: AudioMixPanel,
      head: Header,
    },
  },
]

const router = new VueRouter({
  base: process.env.BASE_URL,
  mode: 'history',
  routes,
})

export default router
