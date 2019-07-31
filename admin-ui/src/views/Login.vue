<template>
  <div class="login-view">
    <img src="../assets/herald-cms-logo.png" style="width:80px;height:80px;margin-bottom:10px;" />
    <div style="margin-bottom:30px;font-size:20px;">身份认证登录</div>
    <el-form ref="form" :model="form" label-width="auto">
      <el-form-item label="登录名">
        <el-input v-model="form.username" placeholder="用户名/电子邮箱/电话号码"></el-input>
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="form.password" placeholder="登录密码" type="password"></el-input>
      </el-form-item>
      <el-form-item label="验证码" v-if="needCaptcha">
        <el-input v-model="form.password" placeholder="此次登陆需要验证码"></el-input>
      </el-form-item>
    </el-form>
    <el-button type="primary" @click="login" style="width:100%;">登录</el-button>
    <div style="margin-top:20px;font-size:12px;color:#909399">先声内容管理 • 「中国特色」的开源CMS</div>
  </div>
</template>

<script>
import "../assets/herald-cms-logo.png";
export default {
  name: "login",
  components: {},
  data() {
    return {
      needCaptcha: false,
      form: {
        username: "",
        password: "",
        captchaCode: ""
      }
    };
  },
  methods: {
    async login() {
      let res = this.$axios.post('/login',this.form)
    }
  }
};
</script>

<style scoped>
.login-view {
  position: fixed;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 40px;
  top: 10vh;
  width: 300px;
  margin: 0 auto;
  left: 0;
  right: 0;
}
</style>

