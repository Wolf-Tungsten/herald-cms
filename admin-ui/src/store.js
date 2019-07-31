import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    isLogin:false,
    accessToken:''
  },
  mutations: {
    login(state, accessToken){
      state.isLogin = true
      Vue.prototype.$axios.defaults.headers.common['Access-Token'] = accessToken
      state.accessToken = accessToken
    },
    logout(state){
      state.isLogin = false,
      state.accessToken = ''
    }
  },
  actions: {

  }
})
