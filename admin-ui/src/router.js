import Vue from 'vue'
import Router from 'vue-router'
//import Home from './views/Home.vue'
import Column from './views/Column.vue'
import Login from './views/Login.vue'
import Activate from './views/Activate.vue'
import Signup from './views/Signup.vue'

Vue.use(Router)

window.$router  = new Router({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/activate',
      name: 'activate',
      component: Activate
    },
    {
      path: '/',
      name: 'column',
      component: Column
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/signup',
      name: 'signup',
      component: Signup
    },
    
  ]
})

export default window.$router