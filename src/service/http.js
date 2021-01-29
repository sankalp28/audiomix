import axios from 'axios'
// import Qs from 'qs';
// import BrowswerLocalStorage from '../common/browswerlocalstorage'
import Router from '../router/index'
// const session = window.localStorage.getItem('accessToken') || ''
import { Message } from 'element-ui'
// http request 拦截器

axios.defaults.withCredentials = true

// 设置默认超时时间为15s， timeoutTips设置为true，会有请求超时的提示，默认不提示
axios.defaults.timeout = 15000
axios.interceptors.request.use(
  (config) => {
    if (config.method === 'post') {
      // config.data = Qs.stringify(config.data);
    }
    // config.headers.Authorization = session
    return config
  },
  (err) => {
    return Promise.reject(err)
  }
).time

axios.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 406:
        case 402:
        case 401:
          Router.push('/login')
          break
        // 超时
        case 504:
          Message({
            message: 'timeOut',
            type: 'error',
          })
          break
      }
    }
    return Promise.reject(error.response)
  }
)
export const $http = axios

export default {
  install: function(vm) {
    vm.prototype.$http = axios
  },
}
