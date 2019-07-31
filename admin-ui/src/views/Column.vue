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
        <div style="height:48px;text-align:left;line-height:48px;font-size:30px;">{{current.name}} <span class="explain-text"> // 栏目设置</span> </div>
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
      newColumnName: ""
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
      this.loading = true;
      let res = await this.$axios.get(`/column/children?parentId=${id}`);
      this.loading = false;
      this.current = res.data.result;
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
