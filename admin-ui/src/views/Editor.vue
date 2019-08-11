<template>
  <el-container style="height:100%;" v-loading="loading">
    <el-main style="padding-right:40px;">
      <el-form ref="titleForm" :model="titleForm" label-width="80px">
        <el-form-item label="文章代码">
          <div
            style="background:rgb(250, 236, 216);font-size:20px;border-radius:8px;padding:0px;width:120px;color:#333;font-weight:bolder;"
          >{{code}}</div>
        </el-form-item>
        <el-form-item label="文章标题">
          <el-input v-model="titleForm.title"></el-input>
        </el-form-item>
      </el-form>
      <el-form ref="contentForm" label-width="80px">
        <el-form-item label="文章内容">
          <div style="text-align:left;">
            <ckeditor :editor="editor" v-model="editorData" :config="editorConfig"></ckeditor>
          </div>
        </el-form-item>
        <el-form-item label="视频/附件">
          <el-col :span="9">
            <div style="text-align:left;">
              <el-upload
                :action="videoUploadUrl"
                :headers="uploadHeaders"
                :data="uploadData"
                name="file"
                list-type="text"
                :multiple="false"
                :file-list="videoFileList"
                :show-file-list="true"
                :on-remove="handleVideoFileRemove"
                :before-upload="beforeVideoUpload"
              >
                <el-button size="small" type="default">上传视频</el-button>
                <div slot="tip" class="el-upload__tip">H.264格式，不超过 1GB</div>
              </el-upload>
            </div>
          </el-col>
          <el-col :span="14" :offset="1">
            <div style="text-align:left;">
              <el-upload
                :action="appendUploadUrl"
                :headers="uploadHeaders"
                :data="uploadData"
                name="file"
                list-type="text"
                :multiple="false"
                :file-list="appendFileList"
                :show-file-list="true"
                :on-remove="handleAppendFileRemove"
                :before-upload="beforeAppendUpload"
              >
                <el-button size="small" type="default">上传附件</el-button>
                <div
                  slot="tip"
                  class="el-upload__tip"
                >大小不超过 1GB，为了保证服务器安全，如需上传文件夹或遇到不支持的文件格式，请先制作成压缩文件后上传</div>
              </el-upload>
            </div>
          </el-col>
        </el-form-item>
        <el-form-item label="定时发布" v-if="permission === 'publish'">
          <div style="text-align:left;">
            <el-switch v-model="isScheduledPublish"></el-switch>
          </div>
        </el-form-item>
        <el-form-item label="发布时间" v-if="isScheduledPublish">
          <el-col :span="8">
            <el-date-picker
              type="datetime"
              placeholder="定时发布时间"
              v-model="publishDate"
              style="width: 100%;"
            ></el-date-picker>
          </el-col>
        </el-form-item>
      </el-form>
      <div style="margin-top:20px;">
        <el-button type="default" @click="save">保存</el-button>
        <el-button type="primary" v-if="permission == 'publish'" @click="saveAndPublish">保存并发布</el-button>
        <el-button type="primary" v-if="permission == 'edit' && status === 'draft'" @click="saveAndPublish">保存并提交审核</el-button>
        <el-button
          type="warning"
          v-if="permission == 'publish' && status === 'reviewing'"
          @click="saveAndReject"
        >驳回审核请求</el-button>
        <el-button
          type="warning"
          v-if="permission == 'edit' && status === 'reviewing'"
          @click="saveAndReject"
        >撤销审核申请</el-button>
        <el-button type="danger" @click="deleteArticle">删除文章</el-button>
        <el-button type="default" @click="navigateBack">返回</el-button>
      </div>
    </el-main>
    <el-aside class="aside">
      <div
        style="font-size:20px;background:#F6F6F6;padding:10px 0; margin-bottom:10px; margin-top:20px"
      >
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
        <el-form-item label="权限文章" style="text-align:left">
          <el-switch v-model="metaForm.limited"></el-switch>
        </el-form-item>
        <el-form-item label="文章置顶" style="text-align:left">
          <el-switch v-model="metaForm.topFixed"></el-switch>
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
            <div
              style="border-radius:4px;border-style:solid;border-width:1px;border-color:#e6e6e6;padding:10px;width:150px;"
            >
              <i class="el-icon-plus"></i>
            </div>
            <div slot="tip" class="el-upload__tip">
              只能上传jpg/png文件
              <br />请按照站点管理要求确定上传文件尺寸
            </div>
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
import ImageUploadAdapterPlugin from "../editor/uploadAdapter";
import moment from "moment";
export default {
  name: "editor",
  components: {},
  data() {
    return {
      coverUploadUrl: `${window.baseURL}upload/cover-img`,
      videoUploadUrl: `${window.baseURL}upload/video`,
      appendUploadUrl: `${window.baseURL}upload/append`,
      coverUrl: "",
      coverFileList: [],
      videoFileList: [],
      appendFileList: [],
      loading: false,
      articleId: "",
      permission: "none",
      status: "draft",
      code: "XXXXXXX",
      titleForm: {
        title: ""
      },
      metaForm: {
        authorName: "",
        abstract: "",
        isRefLink: false,
        refLink: "",
        limited: false,
        topFixed: false
      }, //文章元数据
      isScheduledPublish: false,
      publishDate: "",
      editor: ClassicEditor,
      editorData: "",
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
        extraPlugins: [ImageUploadAdapterPlugin],
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
    async loadArticle() {
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
        this.permission = permissionCheckRes.data.result;
      } else {
        // 无权编辑，跳转回文章管理页
        this.$router.replace({ name: "article" });
      }

      this.$store.commit("setCurrentArticleId", this.articleId);
      // 权限检查完毕，开始获取文章内容
      let res = await this.$axios.get(`/article?articleId=${this.articleId}`);
      if (!res.data.success) {
        //this.$message.error(res.data.reason)
        this.$router.replace({ name: "article" });
      }
      let article = res.data.result;
      this.status = article.status;
      this.code = article.code;
      this.titleForm.title = article.title;
      this.metaForm.authorName = article.authorName;
      this.metaForm.abstract = article.abstract;
      this.metaForm.isRefLink = !!article.refLink;
      this.metaForm.refLink = article.refLink;
      this.metaForm.limited = article.limited;
      this.metaForm.topFixed = article.topFixed;
      this.editorData = article.content;
      this.videoFileList = article.videoList.map(v => {
        return {
          ...v,
          response: { result: { fileId: v.fileId } }
        };
      });
      this.appendFileList = article.appendFileList.map(f => {
        return {
          ...f,
          response: { result: { fileId: f.fileId } }
        };
      });
      this.coverUrl = article.coverUrl;
    },
    getContent() {
      console.log(this.editorData);
    },
    handleCoverUploadSuccess(response, file, fileList) {
      if (response.success) {
        console.log(fileList);
        this.coverUrl = response.result;
      } else {
        this.coverFileList = [];
        this.$message.error("封面上传失败");
      }
    },
    resetCover() {
      this.coverFileList = [];
      this.coverUrl = "";
    },
    beforeVideoUpload(file) {
      if (file.name.split(".")[file.name.split(".").length - 1] !== "mp4") {
        this.$message.error("不支持的文件格式，请转换后重试");
        return false;
      }
      return true;
    },
    beforeAppendUpload(file) {
      let allowed = [
        ".doc",
        ".docx",
        ".xls",
        ".xlsx",
        ".ppt",
        ".pptx",
        ".pdf",
        ".zip",
        ".apk",
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".bmp",
        ".zip",
        ".rar",
        ".gz",
        ".tgz",
        ".gzip",
        // video
        ".mp3",
        ".mp4",
        ".txt"
      ];
      let fileExt = "." + file.name.split(".")[file.name.split(".").length - 1];
      if (allowed.indexOf(fileExt) === -1) {
        this.$message.error("不支持的文件格式");
        return false;
      }
      return true;
    },
    async handleVideoFileRemove(file) {
      await this.$axios.delete(
        `/upload/delete-file?fileId=${file.response.result.fileId}`
      );
    },
    async handleAppendFileRemove(file) {
      await this.$axios.delete(
        `/upload/delete-file?fileId=${file.response.result.fileId}`
      );
    },
    async save() {
      let articleId = this.articleId;
      let title = this.titleForm.title;
      let authorName = this.metaForm.authorName;
      let abstract = this.metaForm.abstract;
      let refLink = this.metaForm.refLink;
      let limited = this.metaForm.limited;
      let topFixed = this.metaForm.topFixed;
      let content = this.editorData;
      let res = await this.$axios.post("/article/save", {
        articleId,
        title,
        authorName,
        abstract,
        refLink,
        content,
        limited,
        topFixed
      });
      if (res.data.success) {
        this.$message({
          type: "success",
          message: res.data.result
        });
      } else {
        this.$message.error(res.data.reason);
      }
    },
    async saveAndPublish() {
      let publishTime = +moment();
      if (this.publishDate) {
        publishTime = +moment(this.publishDate);
      }
      await this.save();
      let res = await this.$axios.post("/article/publish", {
        articleId: this.articleId,
        publishTime
      });
      this.loadArticle();
    },
    async saveAndReject() {
      await this.save();
      let res = await this.$axios.post("/article/cancel-publish", {
        articleId: this.articleId
      });
      this.$router.go(-1);
    },
    async deleteArticle() {
      let res = await this.$axios.delete(
        `/article?articleId=${this.articleId}`
      );
      if (res.data.success) {
        this.$message({
          type: "success",
          message: "文章删除成功"
        });
      }
      this.loadArticle();
    },
    async navigateBack() {
      this.$router.go(-1);
    }
  },
  async created() {
    this.loadArticle();
  }
};
</script>

<style>
.ck-editor__editable_inline {
  min-height: 100px;
}
</style>
