<template>
  <div class="login-view" v-loading="loading">
    <img src="../assets/herald-cms-logo.png" style="width:80px;height:80px;margin-bottom:10px;" />
    <div style="margin-bottom:30px;font-size:20px;">身份认证登录</div>
    <el-form ref="form" :model="form" label-width="auto">
      <el-form-item label="登录名" :error="usernameError">
        <el-input v-model="form.username" placeholder="用户名/电子邮箱/电话号码"></el-input>
      </el-form-item>
      <el-form-item label="密码" :error="passwordError">
        <el-input v-model="form.password" placeholder="登录密码" type="password"></el-input>
      </el-form-item>
      <el-form-item label="验证码" v-if="needCaptcha" :error="captchaError">
        <el-input v-model="form.captchaCode" placeholder="此次登陆需要验证码"></el-input>
      </el-form-item>
      <div v-html="captchaData" style="margin-bottom:10px;"></div>
      
    </el-form>
    <div>
      <el-button type="primary" @click="login" style="width:100%;">登录</el-button>
      <div>
      <el-button type="text" @click="signup" style=" margin-left:0;margin-top:20px;">新用户注册</el-button>
      <el-button type="text" @click="forgetPassword" style="margin-left:30px;margin-top:20px;">忘记密码？</el-button>
      </div>
    </div>
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
      loading:false,
      needCaptcha: false,
      captchaData:'',
      form: {
        username: "",
        password: "",
        captchaCode: ""
      },
      usernameError: "",
      passwordError: "",
      captchaError: ""
    };
  },
  methods: {
    async login() {
      this.loading = true
      this.captchaError = ''
      this.usernameError = ''
      this.passwordError = ''
      let res = await this.$axios.post("/login", this.form);
      this.loading = false
      if (res.data.success) {
        if (res.data.result.needCaptcha) {
          this.needCaptcha = true
          if (this.needCaptcha) {
            // 说明验证码输错了
            this.captchaError = "验证码输入有误";
          }
          this.captchaData = res.data.result.captchaData
        } else {
          //登录成功逻辑
          if(res.data.result.isAdmin || res.data.result.isAuthor){
            this.$store.commit('login', res.data.result.token)
            this.$router.replace({name:'article'})
          } else {
            // 如果是用户就跳转到postLoginUrl
            window.location = res.data.result.postLoginUrl
          }
        }
      } else {
        if (res.data.reason === "用户未激活") {
          this.$router.replace({ name: "activate" });
        } else if (res.data.reason.indexOf("不存在") !== -1) {
          this.usernameError = res.data.reason;
        } else if (res.data.reason.indexOf("密码错误") !== -1) {
          this.passwordError = res.data.reason;
        } else {
          this.$message.error(res.data.reason);
        }
      }
    },
    signup(){
      this.$router.push({name:'signup'})
    },
    forgetPassword(){
      this.$router.push({name:'forget-password'})
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

