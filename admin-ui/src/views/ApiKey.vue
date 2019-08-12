<template>
  <el-container style="height:100%;" v-loading="loading">
    <el-main style>
      <div class="apiKey-main">
        <!-- 标题 -->
        <div style="height:48px;text-align:left;line-height:48px;font-size:30px;">API-Key 管理</div>
        <div class="explain-text">先声 CMS 具备开放能力，允许用户应用与开放接口对接。API-Key 用于用户应用访问接口过程中的身份鉴别。
        </div>

        <div style="margin:20px 0 15px 0;font-weight:bolder; text-align:left">创建新的 API-Key</div>
        <div style="display:flex;flex-direction:row;align-items:flex-start;margin-top:20px;">
          <el-input style="width:360px;" v-model="name" placeholder="便于区分API-Key用途的名称"></el-input>
          <el-button style="margin-left:15px;" type="primary" @click="createApiKey">创建</el-button>
        </div>
        

        <div style="margin:20px 0 15px 0;font-weight:bolder; text-align:left">API-Key 管理</div>
        <el-table :data="apiKeyList" style="margin-top:10px;">
          <el-table-column prop="name" label="名称" width="180"></el-table-column>
          <el-table-column prop="appId" label="AppID" width="280"></el-table-column>
          <el-table-column prop="appSecret" label="AppSecret"></el-table-column>
          <el-table-column label="状态" width="80">
            <template slot-scope="scope">
              <span>{{scope.row.enable ? '使用中':'已停用'}}</span>
            </template>
          </el-table-column>
          <el-table-column width="90">
            <template slot-scope="scope">
              <el-button
                @click.native.prevent="enable(apiKeyList[scope.$index])"
                type="text"
                size="small"
                v-if="!apiKeyList[scope.$index].enable"
              >启用</el-button>
              <el-button
                @click.native.prevent="disable(apiKeyList[scope.$index])"
                type="text"
                size="small"
                v-if="apiKeyList[scope.$index].enable"
              >停用</el-button>
              <el-button
                @click.native.prevent="deleteApiKey(apiKeyList[scope.$index])"
                type="text"
                size="small"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-main>
  </el-container>
</template>

<script>
import moment from "moment";

export default {
  name: "api-key",
  components: {},
  data() {
    //----
    return {
      loading:false,
      apiKeyList:[],
      name:''
    };
    //----
  },
  methods: {
    async loadApiKeyList() {
      let res = await this.$axios.get(
        `/api-key`
      );
      this.apiKeyList = res.data.result
    },
    async enable(apiKey) {
      let res = await this.$axios.post("/api-key/enable", {
        apiKeyId:apiKey._id
      });
      if (res.data.success) {
        await this.loadApiKeyList()
        this.$message({
          message: "启用成功",
          type: "success"
        });

      } else {
        this.$message.error(res.data.reason);
      }
    },
    async disable(apiKey) {
      let res = await this.$axios.post("/api-key/disable", {
        apiKeyId:apiKey._id
      });
      if (res.data.success) {
        await this.loadApiKeyList()
        this.$message({
          message: "停用成功",
          type: "success"
        });

      } else {
        this.$message.error(res.data.reason);
      }
    },
    async delete(apiKey) {
      let res = await this.$axios.delete(`/api-key?apiKeyId=${apiKey._id}`);
      if (res.data.success) {
        await this.loadApiKeyList()
        this.$message({
          message: "删除成功",
          type: "success"
        });

      } else {
        this.$message.error(res.data.reason);
      }
    },
    async createApiKey(){
      let that = this
      let res = await this.$axios.post("/api-key/create", {
        name:that.name
      });
      if (res.data.success) {
        await this.loadApiKeyList()
        this.$message({
          message: "创建成功",
          type: "success"
        });

      } else {
        this.$message.error(res.data.reason);
      }
    }
  },
  async created() {
    await this.loadApiKeyList()
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
