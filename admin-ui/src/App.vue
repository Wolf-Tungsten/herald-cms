<template>
  <div id="app">
    <div class="media-hint show-xxs-only">
      <img
        src="./assets/herald-cms-logo-text.png"
        style="width:auto;height:80px;margin-top:80px;margin-bottom:40px;"
      />
      <p>为了良好的使用体验，请保证浏览器窗口宽度大于600像素</p>
      <p style="font-size:20px;font-weight:bolder;">当前宽度：{{screenWidth}}px</p>
    </div>
    <el-container class="main-cnt hidden-xxs-only">
      <el-header v-if="isLogin">
        <div class="header">
          <img
            src="./assets/herald-cms-logo-text.png"
            style="width:auto;height:55px;"
            class="hidden-xs-only"
          />
          <img
            src="./assets/herald-cms-logo.png"
            style="width:auto;height:55px;"
            class="hidden-sm-and-up"
          />
          <div class="col-line"></div>
          <!-- <div style="font-weight:bold;">站点后台</div> -->
          <div class="space hidden-sm-and-down">
            <el-breadcrumb separator-class="el-icon-arrow-right">
              <el-breadcrumb-item :to="{ path: '/' }">站点后台</el-breadcrumb-item>
              <el-breadcrumb-item>{{currentRouteName}}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <el-menu
            class="el-menu-demo"
            mode="horizontal"
            @select="handleSelect"
            default-active="article"
          >
            <el-menu-item index="article" :route="{name:'article'}" v-if="isAdmin || isAuthor">文章管理</el-menu-item>
            <el-menu-item index="column" :route="{name:'column'}" v-if="isAdmin">栏目设置</el-menu-item>
            <el-menu-item index="role" :route="{name:'role'}" v-if="isAdmin">人员管理</el-menu-item>
            <el-menu-item index="api-key" :route="{name:'api-key'}" v-if="isAdmin">接口设置</el-menu-item>
            <el-submenu index="personal">
              <template slot="title">个人设置</template>
              <el-menu-item index="resetPassword">修改密码</el-menu-item>
              <el-menu-item index="logout">退出登录</el-menu-item>
            </el-submenu>
          </el-menu>
        </div>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>
<script>
import "./assets/herald-cms-logo-text.png";
import "./assets/herald-cms-logo.png";
import "element-ui/lib/theme-chalk/display.css";

export default {
  data() {
    return {
      screenWidth: window.document.documentElement.clientWidth
    };
  },
  created() {
    if (!this.isLogin) {
      this.$router.replace({ name: "login" });
      this.$axios.defaults.headers.common["Access-Token"] = "";
    } else {
      //this.$router.replace({ name: "article" });
      this.$axios.defaults.headers.common[
        "Access-Token"
      ] = this.$store.state.accessToken;
    }
    window.onresize = () => {
      this.screenWidth = window.document.documentElement.clientWidth;
    };
  },
  computed: {
    isLogin() {
      return this.$store.state.isLogin;
    },
    currentRouteName() {
      return this.$store.state.currentRouteName;
    },
    isAdmin(){
      return this.$store.state.userInfo.isAdmin
    },
    isAuthor(){
      return this.$store.state.userInfo.isAuthor
    },
  },
  methods: {
    handleSelect(name) {
      if(name === 'resetPassword'){
        this.$store.commit('resetPassword')
        return
      } else if (name === 'logout'){
        this.$store.commit('logout')
        return
      }
      this.$router.replace({ name });
    }
  }
};
</script>

<style>
html {
  height: 100%;
}
body {
  height: 100vh;
  margin: 1vh 5vh 0 5vh;
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
}
#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
.header {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  border-bottom: solid 1px #e6e6e6;
}
.el-menu-demo {
  border: none !important;
}
.col-line {
  margin: 0 20px;
  height: 20px;
  border-left: solid 1px #e6e6e6;
}
.space {
  flex-grow: 1;
}
.main-cnt {
  height: 100%;
  flex-direction: column !important;
}

@media screen and (max-width: 600px) {
  .hidden-xxs-only {
    display: none !important;
  }
}

@media screen and (min-width: 600px) {
  .show-xxs-only {
    display: none !important;
  }
}
</style>
