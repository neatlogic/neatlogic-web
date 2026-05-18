<template>
  <div>
    <TsDialog
      v-if="type == 'submit'"
      :isShow.sync="showDialog"
      v-bind="submitConfig"
      @on-ok="reviewOk"
    >
      <template v-slot>
        <div slot="content" class="submit-style">
          <div>
            <span class="tsfont-check-s text-success" style="font-size:40px"></span>
            <span class="success-fz">{{ $t('message.commitsuccess') }}</span>
          </div>
          <div class="text-tip">{{ $t('term.knowledge.tooltip.sumbit') }}</div>
          <div class="submit-btn-list">
            <Button
              size="large"
              type="primary"
              style="width:190px;"
              @click="viewDocument('submit')"
            >{{ $t('term.knowledge.viewdoc') }}</Button>
          </div>
          <div class="submit-btn-list">
            <Button size="large" style="width:190px;" @click="togoList">{{ $t('term.knowledge.backknowlist') }}</Button>
          </div>
        </div>
      </template>
    </TsDialog>
    <TsDialog
      v-if="type == 'review'"
      :isShow.sync="showDialog"
      width="390px"
      :hasHeader="false"
      @on-close="close"
      @on-ok="reviewOk"
    >
      <template v-slot>
        <div slot="content">
          <div>
            <span class="tsfont-check-s text-success icon-fz"></span>
            <span class="success-fz">{{ $t('message.commitsuccess') }}</span>
          </div>
          <div class="text-tip content-tip">{{ $t('term.knowledge.confirmreleasenewvers') }}？</div>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  filters: {},
  props: {
    isShow: { type: Boolean, default: false },
    documentId: { type: [String, Number], default: null }, //文档id
    versionId: { type: [String, Number], default: null }, //版本id
    type: { type: String, default: 'submit' } //review:有权限审核；submit：提交
  },
  data() {
    return {
      showDialog: false,
      submitConfig: {
        hasFooter: false,
        width: '390px',
        hasHeader: false,
        showCloseIcon: false
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    close() {
      this.showDialog = false;
      this.$emit('update:isShow', false);
      if (this.type == 'review') {
        this.viewDocument('submit');
      }
    },
    viewDocument(status) {
      const url = status == 'submit'
        ? `/knowledge-detail?knowledgeDocumentId=${this.documentId}&status=${status}&knowledgeDocumentVersionId=${this.versionId}`
        : `/knowledge-detail?knowledgeDocumentId=${this.documentId}&status=${status}`;
      this.$router.push({
        path: url
      });
    },
    reviewOk() {
      let data = {
        knowledgeDocumentVersionId: this.versionId,
        action: 'pass'
      };
      this.$api.knowledge.knowledge.reviewDraftDocument(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess')); //操作成功
          this.viewDocument('passed');
        }
      });
    },
    togoList() {
      this.$router.push({
        path: '/knowledge-overview-all'
      });
    }
  },
  computed: {},
  watch: {
    isShow(val) {
      this.showDialog = val;
    }
  }
};
</script>
<style lang="less" scoped>
.icon-fz {
  font-size: 20px;
}
.success-fz {
  font-size: 16px;
  font-weight: bold;
  padding-left: 12px;
}
.content-tip {
  padding-left: 32px;
}
.submit-style {
  text-align: center;
  .text-tip {
    padding-bottom: 10px;
  }
  .submit-btn-list {
    padding-bottom: 10px;
  }
}
</style>
