import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from './axios'
import 'video.js'
import CKEditor from '@ckeditor/ckeditor5-vue';
import './theme/index.css'
import ElementUI from 'element-ui'

window.baseURL = 'http://localhost:7001/api/v1/'
Vue.config.productionTip = false
Vue.use(CKEditor)
Vue.use(ElementUI)
Vue.use(axios)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
