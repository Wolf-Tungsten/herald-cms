<template>
  <el-container style="height:100%;" v-loading="loading">
    <el-aside class="aside">
      <div style="font-size:20px;background:#F6F6F6;padding:10px 0; margin-bottom:10px;">
        <span class="el-icon-s-unfold" style="margin-right:10px;"></span>选择栏目进行操作
      </div>
      <el-tree
        :data="tree"
        :props="defaultProps"
        node-key="_id"
        @node-click="nodeClick"
        :default-expanded-keys="defaultExpand"
      ></el-tree>
    </el-aside>
    <el-main style="margin-left:20px;">
      <div class="column-main">
        <!-- 标题 -->
        <div style="height:48px;text-align:left;line-height:48px;font-size:30px;">
          {{current.name}}
          <span class="explain-text">// 栏目设置</span>
        </div>
        <div class="explain-text">在此页面进行对当前选中栏目配置，包括子栏目设置、栏目权限管理。</div>

        <!-- 栏目代码 -->
        <div class="subtitle">栏目代码</div>
        <div class="explain-text">栏目代码用于前端站便捷的检索文章</div>
        <div
          style="background:rgb(250, 236, 216);font-size:20px;border-radius:8px;padding:10px;width:120px;color:#333;margin-top:20px;font-weight:bolder;"
        >{{current.code}}</div>

        <!-- 子栏目管理 -->
        <div class="subtitle">子栏目管理</div>
        <div class="explain-text">在当前栏目增加子栏目，或修改、删除现有子栏目</div>
        <el-table :data="current.childrenList" style="margin-top:10px;">
          <el-table-column prop="name" label="栏目名称"></el-table-column>
          <el-table-column prop="code" label="栏目代码"></el-table-column>
          <el-table-column width="60">
            <template slot-scope="scope">
              <el-button
                @click.native.prevent="deleteColumn(scope.$index, current.childrenList)"
                type="text"
                size="small"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div style="display:flex;flex-direction:column;align-items:flex-start;">
          <div style="margin:20px 0 15px 0;font-weight:bolder;">在当前栏目下添加新的子栏目</div>
          <el-input
            style="width:360px;"
            v-model="newColumnName"
            placeholder="新栏目名称（以英文分号分隔输入多个栏目名称）"
          ></el-input>
          <el-button style="margin-top:15px;" type="primary" @click="createColumn">
            添加
            <i class="el-icon-plus el-icon--right"></i>
          </el-button>
        </div>

        <!-- 栏目重命名 -->
        <div class="subtitle">栏目重命名</div>
        <div class="explain-text">修改当前栏目的标题名称</div>
        <div style="display:flex;flex-direction:column;align-items:flex-start;margin-top:20px;">
          <el-input style="width:360px;" v-model="renameColumnName" placeholder="修改栏目名称"></el-input>
          <el-button style="margin-top:15px;" type="primary" @click="renameColumn">重命名</el-button>
        </div>

        <!-- 栏目授权 -->
        <div class="subtitle">栏目权限管理</div>
        <div class="explain-text">管理当前栏目的直接授权</div>
        <div class="explain-text">
          在先声CMS中，站点管理员具有对站点的完全控制权限，如需设置站点管理员请前往“人员管理”选项卡。
          除此之外，为了便于网站权限管理，站点管理员可以将栏目对用户进行授权
          <br />栏目对用户的授权分为【发布权限】和【编辑权限】：
          <br />【发布权限】用户对授权栏目的中的内容具有完全控制
          <br />【编辑权限】用户只能在栏目中添加文章/修改自己创建的文章。文章定稿后需要提交审核，由站点管理员或具备栏目发布权限的用户审核后放行文章
        </div>
        <div class="explain-text">栏目权限拥有继承特性，即对父栏目的授权会同时作用于子栏目</div>

        <div style="margin:20px 0 15px 0;font-weight:bolder; text-align:left">添加新授权</div>
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
          <el-table-column width="180">
            <template slot-scope="scope">
              <el-button
                @click.native.prevent="addPermission(userForPermission[scope.$index], 'publish')"
                type="text"
                size="small"
              >授权发布</el-button>
              <el-button
                @click.native.prevent="addPermission(userForPermission[scope.$index], 'edit')"
                type="text"
                size="small"
                style="margin-left:30px;"
              >授权编辑</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div style="margin:20px 0 15px 0;font-weight:bolder; text-align:left">管理现有授权</div>
        <el-table :data="permissionList" style="margin-top:10px;">
          <el-table-column prop="name" label="用户名"></el-table-column>
          <el-table-column prop="email" label="电子邮箱地址"></el-table-column>
          <el-table-column prop="phoneNumber" label="手机号码"></el-table-column>
          <el-table-column prop="level" label="授权类型"></el-table-column>
          <el-table-column width="60">
            <template slot-scope="scope">
              <el-button
                @click.native.prevent="deletePermission(permissionList[scope.$index])"
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
export default {
  name: "column",
  components: {},
  data() {
    //----
    return {
      loading: false,
      tree: [],
      defaultExpand: [],
      defaultProps: {
        children: "childrenList",
        label: "name"
      },
      currentOpId: "",
      current: { name: "加载中……" },
      newColumnName: "",
      renameColumnName: "",
      permissionList: [],
      emailForFindUser: "",
      userForPermission: []
    };
    //----
  },
  methods: {
    async getColumnTree() {
      this.loading = true;
      let res = await this.$axios.get("/column");
      this.loading = false;
      this.tree = [res.data.result];
      this.defaultExpand = [res.data.result._id];
    },
    async loadCurrent(id) {
      this.currentOpId = id;
      this.emailForFindUser = "";
      this.userForPermission = [];
      this.permissionList = [];
      this.loading = true;
      let res = await this.$axios.get(`/column/children?parentId=${id}`); // 获取子栏目
      this.current = res.data.result;
      await this.loadPermissionList(id);
      this.loading = false;
      // this.loading = true;
      // res = await this.$axios.get(`/permission/column`)
    },
    async loadPermissionList(id) {
      let res = await this.$axios.get(`/permission/column?columnId=${id}`); // 获取栏目授权
      this.permissionList = res.data.result;
    },
    nodeClick(col) {
      this.loadCurrent(col._id);
    },
    deleteColumn(index, list) {
      console.log(index, list);
    },
    async createColumn() {
      this.loading = true;
      let newColumnNames = this.newColumnName.split(";");
      for (let name of newColumnNames) {
        let res = await this.$axios.post("/column/create", {
          name,
          parentId: this.currentOpId
        });
        if (!res.data.success) {
          this.$message.error(res.data.reason);
        }
      }
      this.newColumnName = "";
      await this.getColumnTree();
      await this.loadCurrent(this.currentOpId);
      this.loading = false;
    },
    async renameColumn() {},
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
    async addPermission(user, level) {
      let res = await this.$axios.post("/permission/column", {
        userId: user.id,
        columnId: this.currentOpId,
        level
      });
      if (res.data.success) {
        await this.loadPermissionList(this.currentOpId);
        this.$message({
          message: "授权成功",
          type: "success"
        });
      } else {
        this.$message.error(res.data.reason);
      }
    },
    async deletePermission(user) {
      let res = await this.$axios.delete(`/permission/column?userId=${user.userId}&columnId=${this.currentOpId}`);
      if (res.data.success) {
        await this.loadPermissionList(this.currentOpId);
        this.$message({
          message: "撤销授权成功",
          type: "success"
        });
      } else {
        this.$message.error(res.data.reason);
      }
    }
  },
  async created() {
    await this.getColumnTree();
    this.loadCurrent(this.tree[0]._id);
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
</style>
