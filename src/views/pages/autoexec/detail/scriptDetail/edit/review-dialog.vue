<template>
  <div>
    <TsDialog
      v-if="type == 'submit'"
      :isShow.sync="showDialog"
      v-bind="submitConfig"
    >
      <template v-slot>
        <div slot="content" class="submit-style">
          <div>
            <i class="tsfont-check-s text-success" style="font-size:40px"></i>
            <span class="success-fz">{{ $t('message.commitsuccess') }}</span>
          </div>
          <div class="text-tip">{{ $t('term.autoexec.toolreadyaudit') }}</div>
          <div class="submit-btn-list">
            <Button
              size="large"
              type="primary"
              style="width:190px;"
              @click="viewDocument('submit')"
            >{{ $t('page.viewtool') }}</Button>
          </div>
          <div class="submit-btn-list">
            <Button size="large" style="width:190px;" @click="togoList">{{ $t('term.autoexec.backtolibrary') }}</Button>
          </div>
        </div>
      </template>
    </TsDialog>
    <TsDialog
      v-if="type == 'review'"
      :isShow.sync="showDialog"
      width="390px"
      :hasHeader="false"
      :showCloseIcon="false"
      @on-cancel="close"
      @on-ok="reviewOk"
    >
      <template v-slot>
        <div slot="content">
          <div>
            <i class="tsfont-check-s text-success icon-fz"></i>
            <span class="success-fz">{{ $t('message.commitsuccess') }}</span>
          </div>
          <div class="text-tip content-tip">{{ $t('dialog.content.surepublishthenewversion') }}</div>
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
    id: { type: [String, Number], default: null },
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
      this.$emit('updateData', 'submitted');
      this.$emit('update:isShow', false);
    },
    reviewOk() {
      let data = {
        versionId: this.versionId,
        action: 'pass'
      };
      this.$api.autoexec.script.reviewScript(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
          this.$emit('updateData', 'passed');
          this.$emit('update:isShow', false);
        }
      });
    },
    viewDocument() {
      this.$router.push({
        path: '/review-detail', 
        query: {
          versionId: this.versionId
        }
      });
    },
    togoList() {
      this.$router.push({
        path: '/script-manage'
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
