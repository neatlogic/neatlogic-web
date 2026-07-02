<template>
  <TsDialog
    title="执行SQL"
    type="slider"
    width="large"
    :isShow="true"
    :hasFooter="false"
    @on-close="close"
  >
    <template v-slot>
      <div class="padding">
        <Loading :loadingShow="loadingShow" type="fix"></Loading>
        <div class="mb-md">
          <div class="text-title mb-xs">执行参数</div>
          <JsonViewer boxed copyable :value="executeParam"></JsonViewer>
        </div>
        <div v-if="sqlList.length > 0">
          <div v-for="sqlInfo in sqlList" :key="sqlInfo.id" class="sql-block border-color">
            <div class="sql-block-header bg-op border-color padding-sm">
              <div>
                <span class="text-title">{{ sqlInfo.id }}</span>
                <span v-if="sqlInfo.needPage" class="text-tip ml-xs">分页 {{ sqlInfo.currentPage || 1 }} / {{ sqlInfo.pageSize || 20 }}</span>
              </div>
              <span
                v-clipboard="sqlInfo.executableSql || sqlInfo.sql"
                v-clipboard:success="copySuccess"
                class="tsfont-copy text-action"
              >复制SQL</span>
            </div>
            <div class="padding-sm">
              <TsCodemirror
                :value="sqlInfo.executableSql || sqlInfo.sql"
                :is-read-only="true"
                codeMode="sql"
                height="220px"
              ></TsCodemirror>
              <div v-if="sqlInfo.parameterValueList && sqlInfo.parameterValueList.length > 0" class="mt-sm">
                <div class="text-title mb-xs">参数</div>
                <JsonViewer boxed copyable :value="sqlInfo.parameterValueList"></JsonViewer>
              </div>
            </div>
          </div>
        </div>
        <NoData v-else-if="!loadingShow"></NoData>
      </div>
    </template>
  </TsDialog>
</template>
<script>
import clipboard from '@/resources/directives/clipboard.js';
export default {
  name: 'ReportSqlExecutionDialog',
  components: {
    JsonViewer: () => import('vue-json-viewer'),
    TsCodemirror: () => import('@/resources/plugins/TsCodemirror/TsCodemirror')
  },
  directives: { clipboard },
  props: {
    reportId: {
      type: [Number, String],
      required: true
    },
    params: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      loadingShow: false,
      executeParam: {},
      sqlList: []
    };
  },
  mounted() {
    this.getSqlExecution();
  },
  methods: {
    close() {
      this.$emit('close');
    },
    getSqlExecution() {
      this.loadingShow = true;
      const params = Object.assign({ id: this.reportId }, this.params || {});
      this.$api.report.report.getReportSqlExecution(params).then(res => {
        const result = res.Return || {};
        this.executeParam = result.param || params;
        this.sqlList = result.sqlList || [];
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    copySuccess() {
      this.$Message.success(this.$t('message.copysuccess'));
    }
  }
};
</script>
<style lang="less" scoped>
.sql-block {
  border-width: 1px;
  border-style: solid;
  margin-bottom: 16px;
}
.sql-block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom-width: 1px;
  border-bottom-style: solid;
}
</style>
