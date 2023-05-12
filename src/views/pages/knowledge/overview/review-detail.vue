<template>
  <div>
    <loading :loadingShow="knowledgeLoading" type="fix"></loading>
    <TsContain border="border">
      <template v-slot:navigation>
        <span class="tsfont-left text-action" @click="goPrev(prevPath)">{{ prevPath.name }}</span>
      </template>
      <template v-slot:topLeft>
        <span>{{ newDocumentVo.title }}</span>
      </template>
      <template v-slot:topRight>
        <div class="action-group" style="text-align:right">
          <span
            v-if="newDocumentVo.isReviewable"
            class="action-item tsfont-check"
            :class="{disable:!isPass}"
            @click="reviewDocument('pass')"
          >{{ $t('page.approve') }}</span>
          <span v-if="newDocumentVo.isReviewable" class="action-item tsfont-undo" @click="showDialog = !showDialog">{{ $t('page.backchange') }}</span>
          <span v-if="newDocumentVo.isEditable" class="tsfont-edit action-item" @click="toEditKnowledge(newDocumentVo)">{{ $t('page.edit') }}</span>
          <span
            v-if="newDocumentVo.isMember"
            class="action-item tsfont-history"
            :title="$t('page.activity')"
            @click="isActivityShow = !isActivityShow"
          ></span>
        </div>
      </template>
      <template slot="content">
        <div :is="documentType" v-if="config" :config="config"></div>
      </template>
    </TsContain>
    <TsDialog
      :isShow.sync="showDialog"
      width="390px"
      :title="$t('dialog.title.rollbackconfirm')"
      @on-close="close"
      @on-ok="reviewDocument('reject')"
    >
      <TsForm ref="form" :itemList="formConfig"></TsForm>
    </TsDialog>
    <!-- 活动 -->
    <ActivityDetail :isShow.sync="isActivityShow" :knowledgeDocumentId="knowledgeDocumentId"></ActivityDetail>
  </div>
</template>
<script>
import items from './review/index.js';
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve),
    ActivityDetail: resolve => require(['@/views/pages/knowledge/common/activity-detail.vue'], resolve),
    ...items
  },
  filters: {},
  props: {},
  data() {
    return {
      knowledgeLoading: true,
      prevPath: {
        name: this.$t('page.back'),
        path: '/knowledge-overview-waitingforreview'
      },
      knowledgeDocumentId: null, //文档id
      knowledgeDocumentVersionId: null, //版本id
      documentType: 'AddDocument', //判断文档类型：新增/修改
      config: {},
      showDialog: false,
      formConfig: {
        content: {
          type: 'textarea',
          label: this.$t('page.reason'),
          width: '100%',
          labelWidth: '60',
          autosize: { minRows: 3 },
          validateList: ['required']
        }
      },
      isActivityShow: false,
      newDocumentVo: {},
      isPass: true
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.knowledgeDocumentId = this.$route.query.knowledgeDocumentId;
    this.knowledgeDocumentVersionId = this.$route.query.knowledgeDocumentVersionId;
    let fromVersion = this.$route.query.fromVersion; //来源版本
    if (fromVersion != '0') {
      this.documentType = 'ChangeDocument';
    }
    this.getDocumentConfig(this.documentType);
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    goPrev(item) {
      this.$router.back();
    },
    reviewDocument(action) {
      let data = {
        knowledgeDocumentVersionId: this.knowledgeDocumentVersionId,
        action: action
      };
      if (!this.isPass && action == 'pass') return;
      if (action == 'reject') {
        if (!this.$refs.form.valid()) return;
        let formData = this.$refs.form.getFormValue();
        Object.assign(data, formData);
      }
      this.$api.knowledge.knowledge.reviewDraftDocument(data).then(res => {
        this.isPass = true;
        if (res.Status == 'OK') {
          this.showDialog = false;
          this.$Message.success(this.$t('message.executesuccess')); //操作成功
          this.addNewRule();
          this.goPrev();
        }
      })
        .catch(error => {
          if (error) {
            this.isPass = false;
            this.$set(this.formConfig.content, 'value', error);
          } 
        });
    },
    getDocumentConfig(type) {
      let data = {
        knowledgeDocumentId: this.knowledgeDocumentId,
        knowledgeDocumentVersionId: this.knowledgeDocumentVersionId
      };
      if (type == 'AddDocument') {
        this.$api.knowledge.knowledge.getDocument(data).then(res => {
          if (res.Status == 'OK') {
            this.config = res.Return;
            this.newDocumentVo = res.Return;
            this.knowledgeLoading = false;
          }
        });
      } else {
        this.getVersionDocument();
      }
    },
    getVersionDocument() {
      let data = {
        newVersionId: this.knowledgeDocumentVersionId
      };
      this.$api.knowledge.knowledge.versionDocument(data).then(res => {
        if (res.Status == 'OK') {
          this.config = res.Return;
          if (this.config && this.config.newDocumentVo) {
            this.newDocumentVo = this.config.newDocumentVo;
          }
          this.knowledgeLoading = false;
        }
      });
    },
    close() {
      this.showDialog = false;
    },
    addNewRule() {
      // 刷新左侧菜单
      this.$store.dispatch('leftMenu/getKnowledgeTypeMenu');
    },
    toEditKnowledge({ id: knowledgeDocumentId, knowledgeDocumentTypeUuid, knowledgeDocumentVersionId, title }) {
      this.$router.push({
        name: 'knowledge-edit',
        query: { knowledgeDocumentId, knowledgeDocumentTypeUuid, knowledgeDocumentVersionId, title }
      });
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.action-top {
  position: absolute;
  right: 8px;
  top: 0;
}
</style>
