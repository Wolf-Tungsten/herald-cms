<template>
  <div class="activate-view" v-loading="loading">
    <img src="../assets/herald-cms-logo.png" style="width:80px;height:80px;margin-bottom:10px;" />
    <div style="margin-bottom:30px;font-size:20px;">用户激活</div>
    <el-form ref="form" :model="form" label-width="auto">
      <el-form-item label="电子邮箱地址">
        <el-input v-model="form.email" placeholder="用户注册时登记的电子邮箱" :readonly="isCodeSent"></el-input>
      </el-form-item>
      <el-button type="normal" @click="requestVerify" style="width:100%;" v-if="!isCodeSent">发送验证码</el-button>
      <el-form-item label="验证码" v-if="isCodeSent">
        <el-input v-model="form.emailCode" placeholder="邮件中的验证码" autocomplete="off"></el-input>
      </el-form-item>
    </el-form>
    <el-button type="primary" @click="verify" style="width:100%;" v-if="isCodeSent">激活</el-button>
    <div style="margin-top:20px;font-size:12px;color:#909399">先声内容管理 • 「中国特色」的开源CMS</div>
  </div>
</template>

<script>
import "../assets/herald-cms-logo.png";
import { Verify } from "crypto";
export default {
  name: "activate",
  components: {},
  data() {
    return {
      loading: false,
      isCodeSent: false,
      form: {
        email: "",
        emailCode: ""
      }
    };
  },
  methods: {
    async requestVerify() {
      this.loading = true;
      let res = await this.$axios.post("/request-verify", {
        email: this.form.email
      });
      this.loading = false;
      if (res.data.success) {
        this.isCodeSent = true;
        this.$message({
          message: "验证码已发送，请注意查收！",
          type: "success"
        });
      } else {
        console.log(res.data);
        this.$message.error({
          message: res.data.reason,
          type: "error"
        });
      }
    },
    async verify() {
      this.loading = true;
      let res = await this.$axios.post("/activate", {
        email: this.form.email,
        emailCode: this.form.emailCode
      });
      this.loading = false;
      let that = this
      if (res.data.success) {
        this.$message({
          message: "验证通过，请继续登录",
          type: "success",
          onClose(){
            that.$router.replace({name:'login'})
          }
        });
      } else {
        this.isCodeSent = false
        this.$message.error({
          message: res.data.reason,
          type: "error"
        });
      }
    }
  }
};
</script>

<style scoped>
.activate-view {
  position: fixed;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 40px;
  top: 15vh;
  width: 300px;
  margin: 0 auto;
  left: 0;
  right: 0;
}
</style>

