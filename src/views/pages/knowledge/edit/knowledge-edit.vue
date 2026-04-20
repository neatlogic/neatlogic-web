<template>
  <div>
    <TsContain border="border">
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template slot="topRight">
        <div class="action-group" style="text-align:right">
          <span
            class="action-item tsfont-drafts"
            :class="{disable:disabledBtn.saveDraftDocument}"
            @click="saveDraftDocument(true)"
          >{{ $t('term.knowledge.savedraft') }}</span>
          <span
            class="action-item tsfont-send"
            :class="{disable:disabledBtn.submitDocument}"
            @click="submitDocument"
          >{{ $t('page.submitaudit') }}</span>
          <span
            v-if="hasTemplateAuth"
            class="action-item tsfont-save"
            @click="saveTempalet"
          >{{ $t('term.rdm.saveastemplate') }}</span>
          <span
            v-if="isMember"
            class="action-item tsfont-history"
            @click="isActivityShow = !isActivityShow"
          >{{ $t('page.activity') }}</span>
        </div>
      </template>
      <template slot="content">
        <div>
          <TsKnowledgeDocumentEditor
            ref="editorRef"
            :documentTitle.sync="title"
            :documentConfig="knowledgeConfing"
            :can-edit-title="isReviewer === 1"
            :can-edit-content="isMember === 1"
            :can-edit-tag="isMember === 1"
            :can-edit-attachment="isMember === 1"
            @title-change="handleTitleChange"
          ></TsKnowledgeDocumentEditor>
        </div>
      </template>
    </TsContain>
    <!-- 提交审核 -->
    <ReviewDialog
      :isShow.sync="isReviewShow"
      :documentId="knowledgeDocumentId"
      :versionId="knowledgeDocumentVersionId"
      :type="userType"
    ></ReviewDialog>
    <!-- 活动 -->
    <ActivityOverview :isShow.sync="isActivityShow" :knowledgeDocumentId="knowledgeDocumentId"></ActivityOverview>
    <SaveOverview :isShow.sync="isSaveShow" :dataConfig="saveOverviewData"></SaveOverview>
  </div>
</template>
<script>
export default {
  name: 'KnowledgeEdit',
  components: {
    ReviewDialog: () => import('./main/review-dialog.vue'),
    ActivityOverview: () => import('@/views/pages/knowledge/common/activity-detail.vue'),
    SaveOverview: () => import('./main/save-overview'),
    TsKnowledgeDocumentEditor: () => import('@/resources/plugins/TsKnowledgeDocumentEditor/index.vue')
  },
  filters: {},
  props: [''],
  data() {
    return {
      disabledBtn: {
        saveDraftDocument: false,
        submitDocument: false
      },
      knowledgeConfing: null,
      title: '',
      userType: 'submit', //审核人权限
      knowledgeDocumentId: null, //文档id
      knowledgeDocumentVersionId: null, //版本id
      knowledgeDocumentTypeUuid: null, //类型
      isReviewShow: false, //提交审核弹框
      isActivityShow: false, //活动
      isSaveShow: false, //另存为模板弹窗
      saveOverviewData: {},
      defaultData: null,
      lastEditorSaveData: {},
      isReviewer: 1, //修改标题和类型权限
      isMember: 1,
      defaultConfig: {
        //默认值
        tltle: '',
        knowledgeDocumentTypeUuid: null
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.title = this.$route.query.title || '';
    this.knowledgeDocumentVersionId = this.$route.query.knowledgeDocumentVersionId ? parseInt(this.$route.query.knowledgeDocumentVersionId) : null;
    this.knowledgeDocumentTypeUuid = this.$route.query.knowledgeDocumentTypeUuid || null;
    if (this.$route.query.knowledgeDocumentId) {
      this.knowledgeDocumentId = parseInt(this.$route.query.knowledgeDocumentId);
      this.getDocument();
    } else {
      this.$nextTick(() => {
        this.initDefaultData();
      });
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    this.isSaveShow = false;
    this.isActivityShow = false;
    this.isReviewShow = false;
  },
  destroyed() {},
  methods: {
    getDocument() {
      let data = {
        knowledgeDocumentId: this.knowledgeDocumentId,
        knowledgeDocumentVersionId: this.knowledgeDocumentVersionId
      };
      this.$api.knowledge.knowledge.getDocument(data).then(res => {
        if (res.Status == 'OK') {
          let config = res.Return;
          this.knowledgeConfing = config;
          this.title = config.title;
          this.knowledgeDocumentVersionId = config.knowledgeDocumentVersionId;
          this.knowledgeDocumentTypeUuid = config.knowledgeDocumentTypeUuid;
          this.isReviewer = config.isReviewer;
          this.isMember = config.isMember;
          this.$set(this.defaultConfig, 'title', config.title);
          this.$set(this.defaultConfig, 'knowledgeDocumentTypeUuid', config.knowledgeDocumentTypeUuid);
          this.$nextTick(() => {
            this.initDefaultData();
          });
        }
      });
    },
    initDefaultData() {
      this.defaultData = this.getAllSaveData();
    },
    vaildData() {
      let isVaild = true;
      if (this.title == '' || !this.$utils.nameRegularValid(this.title)) {
        isVaild = false;
        this.$nextTick(() => {
          this.focusEditorTitle();
        });
      }
      return isVaild;
    },
    getAllSaveData(isSubmit) {
      //保存数据
      let data = {
        knowledgeDocumentVersionId: this.knowledgeDocumentVersionId, //版本id
        knowledgeDocumentTypeUuid: this.knowledgeDocumentTypeUuid, //类型
        title: this.title,
        isSubmit: 0 //用“isSubmit”判断是否提交,0表示暂存，1表示提交
      };
      if (isSubmit) {
        this.$set(data, 'isSubmit', 1);
      }
      let editConfig = this.getEditorSaveData();
      Object.assign(data, editConfig);
      return data;
    },
    // 路由层只关心知识库保存协议；编辑器内部的新旧格式转换由组件自己处理。
    getEditorSaveData() {
      const editorRef = this.$refs.editorRef;
      if (editorRef && editorRef.getAllData && !editorRef.isDestroyingEditor) {
        this.lastEditorSaveData = editorRef.getAllData();
        return this.lastEditorSaveData;
      }
      if (this.$refs.editConfig && this.$refs.editConfig.getAllData) {
        this.lastEditorSaveData = this.$refs.editConfig.getAllData();
        return this.lastEditorSaveData;
      }
      // Route leave and modal re-render can happen after the editor starts destroying.
      return this.lastEditorSaveData || {};
    },
    handleTitleChange(title) {
      this.title = title || '';
    },
    saveDraftDocument(type) {
      let _this = this;
      if (!this.vaildData() || _this.disabledBtn.saveDraftDocument) {
        return false;
      }
      return new Promise((resolve, reject) => {
        let data = _this.getAllSaveData();
        _this.disabledBtn.saveDraftDocument = true;
        this.$api.knowledge.knowledge
          .saveDraftDocument(data)
          .then(res => {
            if (res.Status == 'OK') {
              if (type) {
                this.$Message.success(this.$t('message.savesuccess')); //保存成功
              }
              let config = res.Return;
              _this.knowledgeDocumentId = config.knowledgeDocumentId;
              _this.knowledgeDocumentVersionId = config.knowledgeDocumentVersionId;
              _this.defaultData = _this.getAllSaveData();
              this.addNewRule();
              resolve(config);
            }
          })
          .finally(res => {
            _this.disabledBtn.saveDraftDocument = false;
          });
      });
    },
    async submitDocument() {
      if (this.disabledBtn.submitDocument) {
        return;
      }
      this.disabledBtn.submitDocument = true;
      try {
        let data = this.getAllSaveData(1);
        let res = await this.$api.knowledge.knowledge.saveDraftDocument(data);
        this.$Message.success(this.$t('message.executesuccess')); //操作成功
        let config = res.Return;
        this.knowledgeDocumentId = config.knowledgeDocumentId;
        this.knowledgeDocumentVersionId = config.knowledgeDocumentVersionId;
        this.defaultData = this.getAllSaveData();
        this.addNewRule();
        let isReviewable = config.isReviewable;
        if (isReviewable == 1) {
          this.userType = 'review';
        } else {
          this.userType = 'submit';
        }
        this.isReviewShow = true;
        this.addNewRule();
      } finally {
        this.disabledBtn.submitDocument = false;
      }
      //以下：废弃提交审核接口，直接用暂存接口判断，用“isSubmit”判断是否提交
      // await this.saveDraftDocument();
      // let data = {
      //   knowledgeDocumentVersionId: this.knowledgeDocumentVersionId
      // };
      // this.$api.knowledge.knowledge.submitDraftDocument(data).then(res => {
      //   if (res.Status == 'OK') {
      //     this.$Notice.success({ title: '提交成功', duration: 1.5 });
      //     let isReviewable = res.Return.isReviewable;
      //     if (isReviewable == 1) {
      //       this.userType = 'review';
      //     } else {
      //       this.userType = 'submit';
      //     }
      //     this.isReviewShow = true;
      //     this.addNewRule();
      //   }
      // }).finally(res => {
      //   this.disabledBtn.submitDocument = false;
      // });
    },
    //选择分类
    selectType(uuid) {
      this.knowledgeDocumentTypeUuid = uuid;
      this.updateType();
    },
    updateTitle() {
      if (this.knowledgeDocumentId && this.isReviewer == 1 && this.title != this.defaultConfig.title) {
        if (this.title != '' && this.$utils.nameRegularValid(this.title)) {
          this.$set(this.defaultConfig, 'title', this.title);
          let data = {
            knowledgeDocumentId: this.knowledgeDocumentId,
            title: this.title
          };
          this.$api.knowledge.knowledge.updateTitle(data).then(res => {
            if (res.Status == 'OK') {
              this.defaultData.title = this.title;
              this.$Message.success(this.$t('message.executesuccess'));
            }
          });
        } else {
          this.$Notice.error({
            title: this.$t('page.title'),
            desc: this.$t('form.validate.required', { target: this.$t('page.title') }),
            duration: 1.5
          });
          this.$nextTick(() => {
            this.focusEditorTitle();
          });
        }
      }
    },
    updateType() {
      if (!this.knowledgeDocumentId) {
        return;
      }
      if (this.knowledgeDocumentTypeUuid != this.defaultConfig.knowledgeDocumentTypeUuid) {
        this.$set(this.defaultConfig, 'knowledgeDocumentTypeUuid', this.knowledgeDocumentTypeUuid);
        let data = {
          knowledgeDocumentId: this.knowledgeDocumentId,
          knowledgeDocumentTypeUuid: this.knowledgeDocumentTypeUuid
        };
        this.$api.knowledge.knowledge.updateType(data).then(res => {
          if (res.Status == 'OK') {
            this.defaultData.knowledgeDocumentTypeUuid = this.knowledgeDocumentTypeUuid;
            this.$Message.success(this.$t('message.executesuccess'));
          }
        });
      }
    },
    addNewRule() {
      // 刷新左侧菜单
      this.$store.dispatch('leftMenu/getKnowledgeTypeMenu');
    },
    saveTempalet() {
      //另存为模板前判断是否有导航目录
      let list = this.getTemplateData();
      if (list.length === 0) {
        this.$Notice.warning({ title: this.$t('form.validate.required', { target: this.$t('term.knowledge.navigationdirectory') }) });
        return;
      }
      this.saveOverviewData = this.getAllSaveData();
      this.isSaveShow = !this.isSaveShow;
    },
    // 模板弹窗沿用导航目录校验，但目录数据优先从新 Tiptap 编辑器读取。
    getTemplateData() {
      if (this.$refs.editorRef && this.$refs.editorRef.getTemplateData) {
        return this.$refs.editorRef.getTemplateData();
      }
      return [];
    },
    focusEditorTitle() {
      const editorRef = this.$refs.editorRef;
      if (editorRef && typeof editorRef.focusTitle === 'function') {
        editorRef.focusTitle();
      }
    }
  },
  computed: {
    hasTemplateAuth() {
      //判断知识模板权限
      return this.$store.getters.userAuthList.includes('KNOWLEDGE_TEMPLATE_MODIFY');
    }
  },
  watch: {},
  beforeRouteLeave(to, from, next, url) {
    //url为模块跳转，不经过路由，因此需要特别处理
    let newData = this.getAllSaveData();
    let isSame = this.$utils.isSame(newData, this.defaultData);
    if (isSame) {
      url ? this.$utils.gotoHref(url) : next();
    } else {
      let _this = this;
      this.$utils.jumpDialog.call(
        this,
        {
          save: {
            fn: async vnode => {
              return await _this.saveDraftDocument(true);
            }
          }
        },
        to,
        from,
        next,
        url
      );
    }
  }
};
</script>
<style lang="less" scoped>
.action-top {
  position: absolute;
  right: 8px;
  top: 0;
}
.padding-t {
  padding-top: 4px;
}
::v-deep .left-sider {
  border-right: 0px solid #ccc !important;
}
::v-deep .bg-three {
  background: transparent !important;
}
</style>
