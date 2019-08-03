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
      <div class="article-main">
        <!-- 标题 -->
        <div style="height:48px;text-align:left;line-height:48px;font-size:30px;">
          {{current.name}}
          <span class="explain-text">// 文章管理</span>
        </div>
        <div class="explain-text">在此页面进行对当前选中栏目中的文章进行管理</div>

        <!-- 权限不足提示 -->
        <div class="no-permission">⛔️抱歉，您无权操作此栏目！如有疑问请与站点管理员联系。</div>

        <div class="function-block">
          <div class="subtitle">创建文章</div>
          <div class="explain-text">您可以在此栏目创建文章，完成文章创建后将带领您前往编辑页面进行创作。创建文章不会直接向用户发布任何内容，文章只有在您确认发布/送审通过后才会公开展示。</div>
          <div class="function-block-body">
            <el-button type="primary" icon="el-icon-edit">创建文章</el-button>
          </div>
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
      current:{name:'加载中'},
      currentOpId: "",
      permissionList: [],
      hasPublishPermission: false,
      hasEditPermission: false
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
      // TODO 加载待审核/被拒稿列表
      this.current = res.data.result
    },
    async loadCurrent(id) {
      this.currentOpId = id;
    },
    async loadPermissionList() {
      let res = await this.$axios.get(`/permission/user-column`); // 获取栏目授权
      this.permissionList = res.data.result;
    },
    nodeClick(col) {
      this.loadCurrent(col._id);
      this.current = col
    }
  },
  async created() {
    await this.getColumnTree();
    await this.loadPermissionList();
    //this.loadCurrent(this.tree[0]._id);
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
.no-permission{
   background: #FDFFB2;
   padding: 10px;
   border-radius: 8px;
   margin-top: 20px;
}
.function-block-body{
  margin-top:20px;
  display:flex;
  flex-direction: column;
  align-items: flex-start;
}
</style>
