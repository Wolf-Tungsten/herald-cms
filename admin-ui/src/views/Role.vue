<template>
  <el-container style="height:100%;" v-loading="loading">
    <el-main style>
      <div class="role-main">
        <!-- 标题 -->
        <div style="height:48px;text-align:left;line-height:48px;font-size:30px;">人员管理</div>
        <div class="explain-text">在此页面设置、取消站点管理员权限</div>

        <div style="margin:20px 0 15px 0;font-weight:bolder; text-align:left">添加新管理员</div>
        <div style="display:flex;flex-direction:row;align-items:flex-start;margin-top:20px;">
          <el-input style="width:360px;" v-model="emailForFindUser" placeholder="通过邮箱检索用户"></el-input>
          <el-button style="margin-left:15px;" type="primary" @click="findUserForPermission">查找用户</el-button>
        </div>
        <el-table
          :data="userForPermission"
          style="margin-top:10px;"
          v-if="userForPermission.length > 0"
        >
          <el-table-column prop="name" label="用户名"></el-table-column>
          <el-table-column prop="email" label="电子邮箱地址"></el-table-column>
          <el-table-column prop="phoneNumber" label="手机号码"></el-table-column>
          <el-table-column width="100">
            <template slot-scope="scope">
              <el-button
                @click.native.prevent="setAdmin(userForPermission[scope.$index])"
                type="text"
                size="small"
              >设置为管理员</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div style="margin:20px 0 15px 0;font-weight:bolder; text-align:left">现有管理员</div>
        <el-table :data="adminList" style="margin-top:10px;">
          <el-table-column prop="name" label="用户名"></el-table-column>
          <el-table-column prop="email" label="电子邮箱地址"></el-table-column>
          <el-table-column prop="phoneNumber" label="手机号码"></el-table-column>
          <el-table-column width="60">
            <template slot-scope="scope">
              <el-button
                @click.native.prevent="deleteAdmin(adminList[scope.$index])"
                type="text"
                size="small"
              >撤销授权</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-main>
  </el-container>
</template>

<script>
import moment from "moment";
import { mkdir } from "fs";
export default {
  name: "column",
  components: {},
  data() {
    //----
    return {
      loading: false,
      userForPermission: [],
      emailForFindUser: "",
      adminList:[]
    };
    //----
  },
  methods: {
    async loadAdminList() {
      let res = await this.$axios.get(
        `/permission/admin`
      );
      this.adminList = res.data.result
    },
    async findUserForPermission() {
      // 通过邮件查找用户以便于添加授权
      let res = await this.$axios.get(
        `/permission/user-info?email=${this.emailForFindUser}`
      );
      if (res.data.success) {
        this.userForPermission = [res.data.result];
      } else {
        this.$message.error(res.data.reason);
      }
    },
    async setAdmin(user) {
      let res = await this.$axios.post("/permission/admin", {
        userId: user.id
      });
      if (res.data.success) {
        await this.loadAdminList()
        this.$message({
          message: "授权成功",
          type: "success"
        });

      } else {
        this.$message.error(res.data.reason);
      }
    },
    async deleteAdmin(user) {
      let res = await this.$axios.delete(
        `/permission/admin?userId=${user._id}`
      );
      if (res.data.success) {
        await this.loadAdminList()
        this.$message({
          message: "撤销管理员成功",
          type: "success"
        });
      } else {
        this.$message.error(res.data.reason);
      }
    }
  },
  async created() {
    await this.loadAdminList()
  }
};
</script>

<style scoped>
.explain-text {
  font-size: 14px;
  color: #909399;
  text-align: left;
  margin-top: 10px;
}
.subtitle {
  text-align: left;
  font-size: 20px;
  margin-top: 30px;
}
.no-permission {
  background: #fdffb2;
  padding: 10px;
  border-radius: 8px;
  margin-top: 20px;
}
.function-block-body {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
</style>
