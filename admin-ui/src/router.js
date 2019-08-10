import Vue from 'vue'
import Router from 'vue-router'
//import Home from './views/Home.vue'
import Column from './views/Column.vue'
import Login from './views/Login.vue'
import Activate from './views/Activate.vue'
import Signup from './views/Signup.vue'
import Article from './views/Article.vue'
import Editor from './views/Editor.vue'
import ForgetPassword from './views/ForgetPassword.vue'
import Role from './views/Role.vue'
import ApiKey from './views/ApiKey.vue'

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
      path: '/role',
      name: 'role',
      component: Role,
      meta:{displayName:"人员管理"}
    },
    {
      path: '/api-key',
      name: 'api-key',
      component: ApiKey,
      meta:{displayName:"接口设置"}
    },
    {
      path: '/column',
      name: 'column',
      component: Column,
      meta:{displayName:"栏目配置"}
    },
    {
      path: '/article',
      name: 'article',
      component: Article,
      meta:{displayName:"文章管理"}
    },
    {
      path: '/',
      name: 'article',
      component: Article,
      meta:{displayName:"文章管理"}
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
    {
      path: '/forget-password',
      name: 'forget-password',
      component: ForgetPassword
    },
    {
      path: '/editor/:articleId',
      name: 'editor',
      component: Editor,
      meta:{displayName:"编辑文章"}
    },
  ]
})

window.$router.beforeEach((to, from, next) => {
  window.$store.commit('setCurrentRouteName',{from, to})
  next()
})

export default window.$router