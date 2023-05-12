<template>
  <div>
    <DetailCode
      :id="nodeData.id"
      ref="consoleLog"
      type="alone"
      :isRefresh="isRefresh"
      :param="param"
      :bottomHeight="75"
    ></DetailCode>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
export default {
  name: '',
  components: {
  },
  directives: { download },
  filters: {},
  props: {
    jobData: { type: Object },
    phaseData: { type: Object },
    nodeData: { type: Object },
    isRefresh: Boolean
  },
  data() {
    return {
      sqlCode: '',
      loadingMore: false,
      downloadLoading: false,
      descText: this.$t('page.loading')
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.$nextTick(() => {
      this.getSqlCodeHeight();
      this.getSqlCode();
    });
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getSqlCode() {
      this.$api.autoexec.job.getSqlCode({...this.param}).then(res => {
        if (res && res.Status == 'OK') {
          this.descText = this.$t('page.loadfinish');
          this.sqlCode = res.Return.content;
        }
      });
    },
    getSqlCodeHeight() {
      //设置容器的高度
      let config = this.$el.getBoundingClientRect();
      this.$refs.sqlcode.style.height = (document.body.clientHeight - config.top - 88) + 'px';
    }
  },
  computed: {
    param() {
      return {
        jobId: this.jobData.id,
        jobPhaseId: this.phaseData.id,
        resourceId: this.nodeData.resourceId,
        sqlName: this.nodeData.sqlFile
      };
    }
  },
  watch: {}
};
</script>
<style lang='less' scoped>
.script-content-box{
  position: relative;
  .btn-div{
     position: absolute;
     z-index: 10;
     bottom: 10px;
     right: 10px;
  }
  .loadingMore{
    text-align: center;
    opacity: 0.8;
  }
  /deep/.sql-code-box{
    overflow: auto;
    white-space: pre-wrap;
    word-break: break-all;
  }
}

</style>
