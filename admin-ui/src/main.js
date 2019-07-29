import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'video.js'
import CKEditor from '@ckeditor/ckeditor5-vue';

Vue.config.productionTip = false
Vue.use(CKEditor)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
