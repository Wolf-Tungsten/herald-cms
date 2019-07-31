<template>
  <el-container style="height:100%;" v-loading="loading">
    <el-aside class="aside">
        <div style="font-size:20px;background:#F6F6F6;padding:10px 0; margin-bottom:10px;"><span class="el-icon-s-unfold" style="margin-right:10px;"></span>选择栏目进行操作</div>
        <el-tree :data="tree" :props="defaultProps" node-key="_id" @node-click="handleNodeClick" :default-expanded-keys="defaultExpand"></el-tree>
    </el-aside>
    <el-main>栏目管理主要</el-main>
  </el-container>
</template>

<script>
export default {
  name: "column",
  components: {},
  data() {
    //----
    return {
      loading:false,
      tree:[],
      defaultExpand:[],
      defaultProps: {
        children: "childrenList",
        label: "name"
      }
    };
    //----
  },
  methods: {
    async getColumnTree(){
      this.loading = true
      let res = await this.$axios.get('/column')
      this.loading = false
      this.tree = [res.data.result]
      this.defaultExpand = [res.data.result._id]
    }
  },
  created(){
    this.getColumnTree()
  }
};
</script>

<style scoped>
.aside {

}
</style>
