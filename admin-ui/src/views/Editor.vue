<template>
  <div></div>
</template>

<script>
export default {
  name: "editor",
  components: {},
  data() {
    return {
      articleId:'', //正在编辑的文章ID
    };
  },
  methods: {
    getContent() {
      console.log(this.editorData);
    }
  },
  async created(){
    this.articleId = this.$route.params.articleId
    if(!this.$route.params.articleId){
      // 如果文章ID未指定，跳转回文章管理页
      this.$router.replace({name:'article'})
    }
    let permissionCheckRes = await this.$axios.get(`/permission/article?articleId=${this.articleId}`)
    if(permissionCheckRes.data && permissionCheckRes.data.success && permissionCheckRes.data.result !== 'none'){;}
    else{
      // 无权编辑，跳转回文章管理页
      this.$router.replace({name:'article'})
    }
  }
};
</script>
