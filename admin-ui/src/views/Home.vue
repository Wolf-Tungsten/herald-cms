<template>
  <div class="home">
    <!-- <ckeditor :editor="editor" v-model="editorData" :config="editorConfig">
      
    </ckeditor> -->
    <editor :init="{plugins:'media'}"></editor>
    <button @click="getContent">获取内容</button>
  </div>
</template>

<script>
// @ is an alias to /src
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Editor from '@tinymce/tinymce-vue';
//var Editor = require('@tinymce/tinymce-vue').default;
export default {
  name: 'home',
  components: {
    'editor':Editor
  },
  data(){
    return {
                editor: ClassicEditor,
                editorData: '',
                editorConfig: {
                    // The configuration of the editor.
                }
            };
  },
  methods:{
    getContent(){
      console.log(this.editorData)
    }
  }
}
</script>
