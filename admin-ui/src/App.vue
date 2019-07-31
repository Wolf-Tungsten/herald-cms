<template>
  <div id="app">
    <el-container class="main-cnt">
      <el-header v-if="isLogin">
        <div class="header">
          <img src="./assets/herald-cms-logo-text.png" style="width:auto;height:55px;" class="hidden-xs-only" />
          <img src="./assets/herald-cms-logo.png" style="width:auto;height:55px;" class="hidden-sm-and-up"/>
          <div class="col-line"></div>
          <!-- <div style="font-weight:bold;">站点后台</div> -->
          <div class="space hidden-sm-and-down">
            <el-breadcrumb separator-class="el-icon-arrow-right">
              <el-breadcrumb-item :to="{ path: '/' }">站点后台</el-breadcrumb-item>
              <el-breadcrumb-item>活动管理</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <el-menu class="el-menu-demo" mode="horizontal">
            <el-menu-item index="1">文章管理</el-menu-item>
            <el-menu-item index="2">栏目设置</el-menu-item>
            <el-menu-item index="3">人员管理</el-menu-item>
            <el-menu-item index="4">个人设置</el-menu-item>
          </el-menu>
        </div>
      </el-header>
    <el-main style="height:100%;">
      <router-view />
    </el-main>
    </el-container>
    
  </div>
</template>
<script>
import "./assets/herald-cms-logo-text.png";
import "./assets/herald-cms-logo.png";
import 'element-ui/lib/theme-chalk/display.css';
export default {
  created(){
    this.$router.replace({name:'activate'})
  },
  computed:{
    isLogin(){
      return this.$store.state.isLogin
    }
  }
};
</script>

<style>
html{
  height: 100%;
}
body{
  height: 98vh;
  margin: 1vh 10vh;
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
.main-cnt{
  height: 100%;
}
</style>
