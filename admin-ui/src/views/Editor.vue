<template>
  <el-container style="height:100%;" v-loading="loading">
    <el-main style="margin-right:20px;">
      <el-form ref="titleForm" :model="titleForm" label-width="80px">
        <el-form-item label="文章标题">
          <el-input v-model="titleForm.title"></el-input>
        </el-form-item>
      </el-form>
      <el-form ref="contentForm" label-width="80px">
        <el-form-item label="文章内容">
          <div style="text-align:left;">
            <ckeditor
              :editor="editor"
              v-model="editorData"
              :config="editorConfig"
              @ready="onEditorReady"
            ></ckeditor>
          </div>
        </el-form-item>
      </el-form>
    </el-main>
    <el-aside class="aside">
      <div style="font-size:20px;background:#F6F6F6;padding:10px 0; margin-bottom:10px;">
        <span class="el-icon-s-order" style="margin-right:10px;"></span>文章元数据
      </div>
      <el-form ref="metaForm" :model="metaForm" label-width="80px">
        <el-form-item label="作者名称">
          <el-input v-model="metaForm.authorName"></el-input>
        </el-form-item>
        <el-form-item label="文章摘要">
          <el-input
            type="textarea"
            v-model="metaForm.abstract"
            :autosize="{ minRows:4, maxRows: 8}"
          ></el-input>
        </el-form-item>
        <el-form-item label="纯外链" style="text-align:left">
          <el-switch v-model="metaForm.isRefLink"></el-switch>
        </el-form-item>
        <el-form-item label="外链URL" v-if="metaForm.isRefLink">
          <el-input v-model="metaForm.refLink"></el-input>
        </el-form-item>
        <el-form-item label="封面图片">
          <img v-if="coverUrl" :src="coverUrl" style="width:100%; height:auto; border-radius:4px;" />
          <el-button v-if="coverUrl" @click="resetCover">重新选择封面</el-button>
          <el-upload
            :action="coverUploadUrl"
            :headers="uploadHeaders"
            :data="uploadData"
            name="file"
            list-type="picture"
            :on-success="handleCoverUploadSuccess"
            :multiple="false"
            :limit="1"
            :file-list="coverFileList"
            v-else
          >
            <div style="border-radius:4px;border-style:solid;border-width:1px;border-color:#e6e6e6;padding:10px;width:150px;"><i class="el-icon-plus"></i></div>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件<br/>请按照站点管理要求确定上传文件尺寸</div>
            
          </el-upload>
        </el-form-item>
      </el-form>
    </el-aside>
  </el-container>
</template>

<script>
import ClassicEditor from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";
import "@ckeditor/ckeditor5-build-classic/build/translations/zh-cn";
import EssentialsPlugin from "@ckeditor/ckeditor5-essentials/src/essentials";
import Bold from "@ckeditor/ckeditor5-basic-styles/src/bold";
import Italic from "@ckeditor/ckeditor5-basic-styles/src/italic";
import Underline from "@ckeditor/ckeditor5-basic-styles/src/underline";
import Strikethrough from "@ckeditor/ckeditor5-basic-styles/src/strikethrough";
import Code from "@ckeditor/ckeditor5-basic-styles/src/code";
import Subscript from "@ckeditor/ckeditor5-basic-styles/src/subscript";
import Superscript from "@ckeditor/ckeditor5-basic-styles/src/superscript";
import LinkPlugin from "@ckeditor/ckeditor5-link/src/link";
import ParagraphPlugin from "@ckeditor/ckeditor5-paragraph/src/paragraph";
import AlignmentPlugin from "@ckeditor/ckeditor5-alignment/src/alignment";
import PasteFromOffice from "@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice";
import Font from "@ckeditor/ckeditor5-font/src/font";
import Table from "@ckeditor/ckeditor5-table/src/table";
import TableToolbar from "@ckeditor/ckeditor5-table/src/tabletoolbar";
import Heading from "@ckeditor/ckeditor5-heading/src/heading";
import RemoveFormat from "@ckeditor/ckeditor5-remove-format/src/removeformat";
import List from "@ckeditor/ckeditor5-list/src/list";
import Image from "@ckeditor/ckeditor5-image/src/image";
import ImageToolbar from "@ckeditor/ckeditor5-image/src/imagetoolbar";
import ImageCaption from "@ckeditor/ckeditor5-image/src/imagecaption";
import ImageStyle from "@ckeditor/ckeditor5-image/src/imagestyle";
import ImageUpload from "@ckeditor/ckeditor5-image/src/imageupload";
import ImageUploadAdapterPlugin from "../editor/uploadAdapter"

export default {
  name: "editor",
  components: {},
  data() {
    return {
      coverUploadUrl: `${window.baseURL}upload/cover-img`,
      coverUrl:"",
      coverFileList:[],
      loading: false,
      articleId: "",
      titleForm: {
        title: ""
      },
      metaForm: {
        authorName: "",
        abstract: "",
        isRefLink: false,
        refLink: ""
      }, //文章元数据
      editor: ClassicEditor,
      editorData: "<p>初始内容</p>",
      editorConfig: {
        language: "zh-cn",
        plugins: [
          EssentialsPlugin,
          PasteFromOffice,
          Bold,
          Italic,
          Underline,
          Strikethrough,
          Code,
          Subscript,
          Superscript,
          LinkPlugin,
          ParagraphPlugin,
          AlignmentPlugin,
          Font,
          Table,
          TableToolbar,
          Heading,
          RemoveFormat,
          List,
          Image,
          ImageToolbar,
          ImageCaption,
          ImageStyle,
          ImageUpload
        ],
        extraPlugins:[ImageUploadAdapterPlugin],
        toolbar: [
          "undo",
          "redo",
          "|",
          "bold",
          "italic",
          "underline",
          "strikethrough",
          "subscript",
          "superscript",
          "|",
          "heading",
          "paragraphs",
          "|",
          "numberedList",
          "bulletedList",
          "|",
          "link",
          "insertTable",
          "imageTextAlternative",
          "imageUpload",
          "|",
          "fontSize",
          "fontFamily",
          "fontColor",
          "fontBackgroundColor",
          "|",
          "alignment:left",
          "alignment:center",
          "alignment:right",
          "alignment:justify",
          "|",
          "removeFormat"
        ],
        alignment: {
          options: ["left", "center", "right", "justify"]
        },
        table: {
          contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"]
        },
        fontSize: {
          options: [9, 11, 13, 17, 19, 21, 24, 28, 36]
        }
      }
    };
  },
  computed: {
    uploadHeaders() {
      let that = this;
      return {
        "Access-Token": that.$store.state.accessToken
      };
    },
    uploadData() {
      let that = this;
      return {
        articleId: that.articleId
      };
    }
  },
  methods: {
    getContent() {
      console.log(this.editorData);
    },
    handleCoverUploadSuccess(response, file, fileList){
      if(response.success){
        console.log(fileList)
        this.coverUrl = response.result
      } else {
        this.coverFileList = []
        this.$message.error('封面上传失败')
      }
    },
    resetCover(){
      this.coverFileList = []
      this.coverUrl = ''
    },
    onEditorReady() {
      console.log(this.editor.ui); //.componentFactory.names());
    }
  },
  async created() {
    this.articleId = this.$route.params.articleId;
    if (!this.$route.params.articleId) {
      // 如果文章ID未指定，跳转回文章管理页
      this.$router.replace({ name: "article" });
    }
    let permissionCheckRes = await this.$axios.get(
      `/permission/article?articleId=${this.articleId}`
    );
    if (
      permissionCheckRes.data &&
      permissionCheckRes.data.success &&
      permissionCheckRes.data.result !== "none"
    ) {
    } else {
      // 无权编辑，跳转回文章管理页
      this.$router.replace({ name: "article" });
    }
    this.$store.commit('setCurrentArticleId', this.articleId)
  }
};
</script>
