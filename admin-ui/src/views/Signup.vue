<template>
  <div class="signup-view" v-loading="loading">
    <img src="../assets/herald-cms-logo.png" style="width:80px;height:80px;margin-bottom:10px;" />
    <div style="margin-bottom:30px;font-size:20px;">新用户注册</div>

    <el-form ref="form" :model="form" label-width="auto" >
      <el-form-item label="用户名" :error="usernameError" >
        <el-input v-model="form.username" placeholder="用户名"></el-input>
			</el-form-item>
			<el-form-item label="密码" :error="passwordError">
        <el-input v-model="form.password" placeholder="密码(至少8位)" type="password"></el-input>
			</el-form-item>
			<el-form-item label="确认密码" :error="pwdconfirmError">
        <el-input v-model="form.passwordConfirm" placeholder="确认密码" type="password"></el-input>
			</el-form-item>
			<el-form-item label="邮箱" :error="emailError">
        <el-input v-model="form.email" placeholder="邮箱地址"></el-input>
			</el-form-item>
			<el-form-item label="联系电话" :error="phoneNumberError">
        <el-input v-model="form.phoneNumber" placeholder="联系电话"></el-input>
			</el-form-item>
    </el-form>
    <el-button type="primary" @click="signup" style="width:100%;">注册</el-button>
    <div style="margin-top:20px;font-size:12px;color:#909399">先声内容管理 • 「中国特色」的开源CMS</div>
  
  </div>
  

</template>

<script>
import "../assets/herald-cms-logo.png";
export default {
  name: "signup",
  components: {},
  data() {
    return {
      loading:false,
      form: {
        username:"", 
        password:"", 
        email:"", 
        phoneNumber:"", 
        passwordConfirm:""
			},
			emailError:"",
      usernameError: "",
      passwordError: "",
      pwdconfirmError:"",
      phoneNumberError:""
    };
  },
  methods: {
    async signup() {
      this.loading = true
      this.emailError="";
      this.usernameError= "";
      this.passwordError= "";
      this.pwdconfirmError="";
      this.phoneNumberError="";

      let res = await this.$axios.post("/signup", this.form);
      this.loading = false
      let that = this
      if (res.data.success) {
        this.$message({
          message: "注册完成，请继续完成激活",
          type: "success",
          onClose(){
            that.$router.replace({name:'activate'})
          }
        });
      } else {
        if (res.data.reason === "用户名已占用，请更换") {
          this.usernameError = res.data.reason;
        } else if (res.data.reason.indexOf("用户名格式不合法") !== -1) {
          this.usernameError = res.data.reason;
				}else if (res.data.reason.indexOf("密码长度小于8位，请重新设置") !== -1) {
          this.passwordError = res.data.reason;
        }else if (res.data.reason.indexOf("两次密码输入不一致") !== -1) {
          this.pwdconfirmError = res.data.reason;
        }else if (res.data.reason.indexOf("电子邮箱格式不正确，请检查") !== -1) {
          this.emailError = res.data.reason;
				}else if (res.data.reason.indexOf("电子邮箱地址已被注册，请更换") !== -1) {
          this.emailError = res.data.reason;
        }
				else {
          this.$message.error(res.data.reason);
        }
      }
    }
  }
};
</script>

<style scoped>
.signup-view {
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

