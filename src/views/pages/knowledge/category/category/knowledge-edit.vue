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
          <KnowledgeEditor
            ref="editorRef"
            :documentTitle.sync="title"
            :documentConfig="knowledgeConfing"
            :can-edit-title="isReviewer === 1"
            :can-edit-content="isMember === 1"
            :can-edit-tag="isMember === 1"
            :can-edit-attachment="isMember === 1"
            @title-change="handleTitleChange"
          ></KnowledgeEditor>
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
    ReviewDialog: () => import('../review/review-dialog.vue'),
    ActivityOverview: () => import('@/views/pages/knowledge/category/category/activity-detail-dialog.vue'),
    SaveOverview: () => import('./save-overview'),
    KnowledgeEditor: () => import('@/views/pages/knowledge/category/knowledgeeditor/index.vue')
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
      userType: 'submit', //审核人
      knowledgeDocumentId: null, //文档id
      knowledgeDocumentVersionId: null, //版本id
      knowledgeDocumentTypeUuid: null, //类型
      isReviewShow: false, //提交审核弹框
      isActivityShow: false, //活动
      isSaveShow: false, //另存为模板弹框
      saveOverviewData: {},
      defaultData: null,
      isReviewer: 1, //修改标题和类型权限?
      isMember: 1,
      defaultConfig: {
        //默认配置?
        title: '',
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
    validData() {
      const editorRef = this.$refs.editorRef;
      let isValid = true;
      if (editorRef && typeof editorRef.validData === 'function') {
        isValid = editorRef.validData();
      }
      return isValid;
    },
    getAllSaveData(isSubmit) {
      //保存数据
      let data = {
        knowledgeDocumentVersionId: this.knowledgeDocumentVersionId, //版本id
        knowledgeDocumentTypeUuid: this.knowledgeDocumentTypeUuid, //类型
        title: this.title,
        isSubmit: 0 //用“isSubmit”判断是否提交，0表示暂存，1表示提交
      };
      if (isSubmit) {
        this.$set(data, 'isSubmit', 1);
      }
      let editConfig = this.getEditorSaveData();
      Object.assign(data, editConfig);
      return data;
    },
    // 路由层只关心知识库保存协议；编辑器内部的新旧格式转换由组件自己处理
    getEditorSaveData() {
      const editorRef = this.$refs.editorRef;
      let saveData = {};
      if (editorRef && editorRef.getAllData) {
        saveData = {...(editorRef.getAllData() || {}), title: this.title};
      }
      return saveData;
    },
    handleTitleChange(title) {
      this.title = title || '';
    },
    saveDraftDocument(type) {
      let _this = this;
      if (!this.validData() || _this.disabledBtn.saveDraftDocument) {
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
      if (!this.validData()) {
        return false;
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
    },
    //选择分类
    selectType(uuid) {
      this.knowledgeDocumentTypeUuid = uuid;
      this.updateType();
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
    // 模板弹窗沿用导航目录校验，但目录数据优先从新 Tiptap 编辑器读取
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
</style>
