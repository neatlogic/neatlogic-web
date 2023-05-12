<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="closeDialog">
      <template v-slot>
        <div class="bg-op padding radius-md">
          <Loading v-if="isLoading" :loadingShow="isLoading" type="fix"></Loading>
          {{ logContent }}
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
  },
  props: {
    auditId: {type: Number}
  },
  data() {
    return {
      isLoading: false,
      logContent: '', //日志信息内容
      dialogConfig: {
        type: 'modal',
        title: this.$t('page.log'),
        hasFooter: false,
        maskClose: true,
        isShow: true,
        width: 'medium'
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getLog();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    closeDialog() {
      this.$emit('close');
    },
    getLog: function() {
      if (this.auditId) {
        this.isLoading = true;
        this.$api.framework.schedule.auditLogGet({ auditId: this.auditId }).then(res => {
          if (res.Status == 'OK') {
            this.logContent = res.Return;
          }
        }).finally(() => {
          this.isLoading = false;
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
.codeLog {
  width: 100%;
  height: calc(100vh - 100px);
  min-height: 500px;
  .CodeMirror {
    height: 100%;
  }
}
</style>
