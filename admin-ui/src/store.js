import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist'

const vuexLocal = new VuexPersistence({
  storage: window.localStorage
})

Vue.use(Vuex)

window.$store = new Vuex.Store({
  plugins:[vuexLocal.plugin],
  state: {
    isLogin:false,
    accessToken:'',
    currentRouteName:'',
    currentArticleId:''
  },
  mutations: {
    login(state, accessToken){
      state.isLogin = true
      Vue.prototype.$axios.defaults.headers.common['Access-Token'] = accessToken
      state.accessToken = accessToken
    },
    logout(state){
      state.isLogin = false,
      Vue.prototype.$axios.defaults.headers.common['Access-Token'] = ''
      state.accessToken = ''
      window.$router.replace({name:'login'})
    },
    setCurrentRouteName(state, routeName){
      let { _, to } = routeName
      state.currentRouteName = to.meta.displayName
    },
    setCurrentArticleId(state, articleId){
      state.currentArticleId = articleId
    }
  },
  actions: {

  }
})

export default window.$store