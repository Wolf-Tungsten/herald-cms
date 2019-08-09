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
          {{currentColumn.name}}
          <span class="explain-text">// 文章管理</span>
        </div>
        <div class="explain-text">在此页面进行对当前选中栏目中的文章进行管理，请选择右侧具体栏目进行操作</div>

        <!-- 权限不足提示 -->
        <div
          class="no-permission"
          v-if="currentColumn.name !== '站点' && !hasEditPermission && !hasPublishPermission"
        >⛔️抱歉，您无权操作此栏目！如有疑问请与站点管理员联系。</div>

        <!-- 创建文章面板 -->
        <div class="function-block" v-if="currentColumn.name !== '站点' && hasEditPermission">
          <div class="subtitle">创建文章</div>
          <div
            class="explain-text"
          >您可以在此栏目创建文章，完成文章创建后将带领您前往编辑页面进行创作。创建文章不会直接向用户发布任何内容，文章只有在您确认发布/送审通过后才会公开展示。</div>
          <div class="function-block-body">
            <el-button
              type="primary"
              icon="el-icon-edit"
              @click="createArticle"
              v-loading="creatingArticle"
            >创建文章</el-button>
          </div>
        </div>

        <!-- 等待审核面板 -->
        <div class="function-block" v-if="reviewingArticleList.length > 0 && hasPublishPermission">
          <div class="subtitle">等待审核</div>
          <div class="explain-text">此处显示等待您审核的文章，请尽快操作</div>
          <div class="function-block-body">
            <el-table :data="reviewingArticleList" max-height="300" stripe>
              <el-table-column prop="title" label="文章标题"></el-table-column>
              <el-table-column prop="lastModifiedTimeDisp" label="最新修改时间" width="150"></el-table-column>
              <el-table-column prop="columnName" label="所在栏目" width="100"></el-table-column>
              <el-table-column width="180">
                <template slot-scope="scope">
                  <el-button
                    @click.native.prevent="editArticle(scope.$index, reviewingArticleList)"
                    type="default"
                    size="small"
                  >前往审核</el-button>
                  <el-button
                    @click.native.prevent="deleteArticle(scope.$index, reviewingArticleList)"
                    type="danger"
                    size="small"
                  >删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>

        <!-- 我的草稿面板 -->
        <div class="function-block" v-if="ownDraftList.length > 0 && (hasEditPermission || currentColumn.name === '站点')">
          <div class="subtitle">我的草稿</div>
          <div class="explain-text">此处显示您正在编辑中的文章</div>
          <div class="function-block-body">
            <el-table :data="ownDraftList" max-height="300" stripe>
              <el-table-column prop="title" label="文章标题"></el-table-column>
              <el-table-column prop="lastModifiedTimeDisp" label="最新修改时间" width="150"></el-table-column>
              <el-table-column prop="columnName" label="所在栏目" width="100"></el-table-column>
              <el-table-column width="180">
                <template slot-scope="scope">
                  <el-button
                    @click.native.prevent="editArticle(scope.$index, ownDraftList)"
                    type="default"
                    size="small"
                  >继续编辑</el-button>
                  <el-button
                    @click.native.prevent="deleteArticle(scope.$index, ownDraftList)"
                    type="danger"
                    size="small"
                  >删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>

        <!-- 审核中面板 -->
        <div class="function-block" v-if="ownReviewingList.length > 0 && (hasEditPermission || currentColumn.name === '站点')">
          <div class="subtitle">审核中的文章</div>
          <div class="explain-text">此处显示由您撰写且处于审核状态的文章，在审核通过之前您可以继续修改。</div>
          <div class="function-block-body">
            <el-table :data="ownReviewingList" max-height="300" stripe>
              <el-table-column prop="title" label="文章标题"></el-table-column>
              <el-table-column prop="lastModifiedTimeDisp" label="最新修改时间" width="150"></el-table-column>
              <el-table-column prop="columnName" label="所在栏目" width="100"></el-table-column>
              <el-table-column width="180">
                <template slot-scope="scope">
                  <el-button
                    @click.native.prevent="editArticle(scope.$index, ownReviewingList)"
                    type="default"
                    size="small"
                  >前往修改</el-button>
                  <el-button
                    @click.native.prevent="deleteArticle(scope.$index, ownReviewingList)"
                    type="danger"
                    size="small"
                  >删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>

        <!-- 被拒稿面板 -->
        <div class="function-block" v-if="ownRejectedList.length > 0  && (hasEditPermission || currentColumn.name === '站点')">
          <div class="subtitle">被拒稿的文章</div>
          <div class="explain-text">此处显示由您撰写但被栏目管理员拒稿的文章，在再次提交审核前，请您修改。</div>
          <div class="function-block-body">
            <el-table :data="ownRejectedList" max-height="300" stripe>
              <el-table-column prop="title" label="文章标题"></el-table-column>
              <el-table-column prop="lastModifiedTimeDisp" label="最新修改时间" width="150"></el-table-column>
              <el-table-column prop="columnName" label="所在栏目" width="100"></el-table-column>
              <el-table-column width="180">
                <template slot-scope="scope">
                  <el-button
                    @click.native.prevent="editArticle(scope.$index, ownRejectedList)"
                    type="default"
                    size="small"
                  >继续编辑</el-button>
                  <el-button
                    @click.native.prevent="deleteArticle(scope.$index, ownRejectedList)"
                    type="danger"
                    size="small"
                  >删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>

        <!-- 栏目文章面板 -->
        <div
          class="function-block"
          v-if="currentColumn.name!=='站点' && (hasEditPermission || hasPublishPermission)"
        >
          <div class="subtitle">栏目文章</div>
          <div class="explain-text">此处显示栏目中的所有您可以访问/编辑的文章</div>
          <el-form style="margin-top:20px;">
            <el-form-item label>
              <el-col :span="10">
                <el-input
                  placeholder="按文章标题过滤"
                  prefix-icon="el-icon-search"
                  v-model="titleFilter"
                  @change="handleTitleFilterChange"
                  :clearable="true"
                ></el-input>
              </el-col>
            </el-form-item>
          </el-form>
          <div class="function-block-body">
            <el-table :data="fullArticleList" max-height="600" stripe>
              <el-table-column prop="code" label="#" width="100"></el-table-column>
              <el-table-column prop="title" label="文章标题"></el-table-column>
              <el-table-column prop="authorName" label="作者署名" width="100"></el-table-column>
              <el-table-column prop="lastModifiedTimeDisp" label="最新修改时间" width="150"></el-table-column>
              <el-table-column prop="statusDisp" label="发布状态" width="100"></el-table-column>
              <el-table-column width="200">
                <template slot-scope="scope">
                  <el-button
                    @click.native.prevent="editArticle(scope.$index, fullArticleList, scope)"
                    type="default"
                    size="small"
                    v-if="scope.row.status === 'draft'"
                  >前往编辑</el-button>
                  <el-button
                    @click.native.prevent="editArticle(scope.$index, fullArticleList)"
                    type="default"
                    size="small"
                    v-if="scope.row.status === 'reviewing'"
                  >前往审核</el-button>
                  <el-button
                    @click.native.prevent="cancelPublish(scope.$index, fullArticleList)"
                    type="default"
                    size="small"
                    v-if="scope.row.status === 'published'"
                  >取消发布</el-button>
                  <el-button
                    @click.native.prevent="editArticle(scope.$index, fullArticleList)"
                    type="default"
                    size="small"
                    v-if="scope.row.status === 'rejected'"
                  >重新编辑</el-button>
                  <el-button
                    @click.native.prevent="deleteArticle(scope.$index, fullArticleList)"
                    type="danger"
                    size="small"
                  >删除文章</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-pagination
              @size-change="handleArticleListSizeChange"
              @current-change="handleArticleListCurrentChange"
              :current-page="this.page"
              :page-sizes="[5, 10, 20, 50, 100]"
              :page-size="this.pagesize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="this.articleAmount"
              style="margin-top:20px;"
            ></el-pagination>
          </div>
        </div>
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
      tree: [],
      defaultExpand: [],
      defaultProps: {
        children: "childrenList",
        label: "name"
      },
      currentColumn: { name: "加载中" },
      permissionList: { publish: [], edit: [] },
      creatingArticle: false,
      ownDraftList: [],
      ownReviewingList: [],
      ownRejectedList: [],
      wholeOwnDraftList: [],
      wholeOwnReviewingList: [],
      wholeOwnRjectedList: [],
      reviewingArticleList: [],
      fullArticleList: [],
      articleAmount: 0,
      page: 1,
      pagesize: 10,
      titleFilter: ""
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
      this.currentColumn = res.data.result;
      this.loadCurrentColumn(this.currentColumn);
    },
    async loadCurrentColumn(col) {
      let columnId = col.name === "站点" ? "" : col._id;
      let res;
      if (col.name === "站点") {
        // 如果是 0 级栏目获取自己的草稿、审核中、审核被拒的文章
        res = await this.$axios.get("/article/list/own");
        this.ownDraftList = res.data.result ? res.data.result.draft : [];
        this.ownDraftList = this.ownDraftList.map(article => {
          article.lastModifiedTimeDisp = moment(
            article.lastModifiedTime
          ).format("YYYY-MM-DD HH:mm:ss");
          return article;
        });
        this.ownReviewingList = res.data.result
          ? res.data.result.reviewing
          : [];
        this.ownReviewingList = this.ownReviewingList.map(article => {
          article.lastModifiedTimeDisp = moment(
            article.lastModifiedTime
          ).format("YYYY-MM-DD hh:mm:ss");
          return article;
        });
        this.ownRejectedList = res.data.result ? res.data.result.rejected : [];
        this.ownRejectedList = this.ownRejectedList.map(article => {
          article.lastModifiedTimeDisp = moment(
            article.lastModifiedTime
          ).format("YYYY-MM-DD hh:mm:ss");
          return article;
        });
        this.wholeOwnDraftList = this.ownDraftList;
        this.wholeOwnReviewingList = this.ownReviewingList;
        this.wholeOwnRejectedList = this.ownRejectedList;
        // 获取等待审核的文章
        res = await this.$axios.get(`/article/list/reviewing`);
        this.reviewingArticleList = res.data.result ? res.data.result : [];
      } else {
        this.ownDraftList = this.wholeOwnDraftList.filter(
          a => a.columnId === col._id
        );
        this.ownReviewingList = this.wholeOwnReviewingList.filter(
          a => a.columnId === col._id
        );
        this.ownRejectedList = this.wholeOwnRejectedList.filter(
          a => a.columnId === col._id
        );
        // 获取当前栏目下等待审核的文章
        res = await this.$axios.get(
          `/article/list/reviewing?articleId=${col._id}`
        );
        this.reviewingArticleList = res.data.result ? res.data.result : [];
        // 获取栏目文章列表
        this.pagesize = 10;
        this.page = 1;
        this.loadFullArticleList();
      }
    },
    async loadPermissionList() {
      let res = await this.$axios.get(`/permission/user-column`); // 获取栏目授权
      this.permissionList = res.data.result;
    },
    nodeClick(col) {
      this.loadCurrentColumn(col);
      this.currentColumn = col;
    },
    async createArticle() {
      this.creatingArticle = true;
      let res = await this.$axios.post("/article/create", {
        columnId: this.currentColumn._id
      });
      if (res.data.success) {
        this.$router.push({ path: `/editor/${res.data.result}` });
      } else {
        this.$message.error(res.data.reason);
      }
      this.creatingArticle = false;
    },
    editArticle(index, list, scope) {
      this.$router.push({ path: `/editor/${list[index].id}` });
    },
    async deleteArticle(index, list) {
      let articleId = list[index].id;
      let res = await this.$axios.delete(`/article?articleId=${articleId}`);
      if (res.data.success) {
        list.splice(index, 1);
        this.loadFullArticleList();
      }
    },
    async handleArticleListSizeChange(val) {
      this.pagesize = val;
      loadFullArticleList();
    },
    async handleArticleListCurrentChange(val) {
      this.page = val;
      loadFullArticleList();
    },
    async handleTitleFilterChange() {
      this.page = 1;
      this.loadFullArticleList();
    },
    async loadFullArticleList() {
      let res = await this.$axios.get(
        `/article/list/column?columnId=${this.currentColumn._id}&page=${this.page}&pagesize=${this.pagesize}&title=${this.titleFilter}`
      );
      this.fullArticleList = res.data.result ? res.data.result.articleList : [];
      this.articleAmount = res.data.result ? res.data.result.articleAmount : 0;
      let statusDispMap = {
        draft: "草稿",
        reviewing: "等待审核",
        rejected: "被拒稿",
        published: "已发布"
      };
      this.fullArticleList = this.fullArticleList.map(a => {
        a.statusDisp = statusDispMap[a.status];
        a.lastModifiedTimeDisp = moment(a.lastModifiedTime).format(
          "YYYY-MM-DD HH:mm:ss"
        );
        if (a.publishTime > +moment()) {
          a.statusDisp = "定时发布中";
        }
        return a;
      });
    },
    async cancelPublish(index, list) {
      let articleId = list[index].id;
      let res = await this.$axios.post(`/article/cancel-publish`, {
        articleId
      });
      this.loadFullArticleList();
    }
  },
  watch: {},
  computed: {
    hasPublishPermission() {
      let publish = this.permissionList.publish.map(c => c.id);
      return publish.indexOf(this.currentColumn._id) !== -1;
    },
    hasEditPermission() {
      let edit = this.permissionList.edit.map(c => c.id);
      return edit.indexOf(this.currentColumn._id) !== -1;
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
