<template>
  <div>
    <div class="action-group line">
      <template v-if="phaseData && phaseData.execMode === 'runner'">
        <span
          v-if="jobData.isCanExecute"
          class="action-item tsfont-restart"
          :class="phaseData.status == 'running' ? 'disable' : 'text-action'"
          @click="runnerAction('reset')"
        >{{ $t('page.reset') }}</span>
        <span
          v-if="jobData.isCanExecute"
          class="action-item tsfont-minus-o"
          :class="phaseData.status != 'failed' ? 'disable' : 'text-action'"
          @click="runnerAction('ignore')"
        >{{ $t('page.ignore') }}
        </span>
        <span
          v-if="jobData.isCanExecute"
          class="action-item tsfont-run"
          :class="phaseData.status == 'running' ? 'disable' : 'text-action'"
          @click="runnerAction('refire')"
        >{{ $t('page.execute') }}
        </span>
      </template>
      <span
        v-if="!downLoading && paramList.length > 0"
        v-download="getDownurl()"
        class="action-item tsfont-download"
      >{{ $t('term.autoexec.paramdownload') }}</span>
      <span v-if="downLoading" class="action-item disable" :title="$t('page.downloadloadingtip')">
        <Icon type="ios-loading" size="18" class="loading"></Icon>
        {{ $t('page.downloading') }}
      </span>
    </div>
    <div v-for="(item, index) in paramList" :key="index">
      <Divider v-if="(item.paramList && item.paramList.length > 0) || (!$utils.isEmptyObj(item.argument) && item.argument.valueList&& item.argument.valueList.length>0)" orientation="left">{{ item.name }}{{ item.letter?"_"+item.letter:"" }}</Divider>
      <NodeParamTable :paramList="item.paramList" :argument="item.argument" :fileDownload="downloadFile"></NodeParamTable>
    </div>
    <Loading v-if="isLoading && paramList.length <= 0"></Loading>
    <NoData v-else-if="!isLoading && paramList.length <= 0"></NoData>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
export default {
  name: '',
  components: {
    NodeParamTable: () => import('./node-param-table.vue')
  },
  directives: { download },
  filters: {},
  props: {
    id: [Number, String],
    jobPhaseId: [Number, String], //剧本id
    resourceId: [Number, String], //资源id
    sqlName: [String, String], //作业文件名
    jobId: [Number, String], // 作业id
    type: [String, String], //输入|输出 参数
    phaseData: { type: Object },
    jobData: { type: Object }
  },
  data() {
    let _this = this;
    return {
      paramList: [],
      downurl: {
        url: '/api/binary/autoexec/job/phase/node/' + this.type + '/download',
        params: {
          jobPhaseId: _this.jobPhaseId,
          resourceId: _this.resourceId
        },
        method: 'post'
      },
      downLoading: false,
      isLoading: false
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getData();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    // 读取本节点当次作业的输入或输出，切换节点时忽略迟到的请求。
    async getData() {
      const nodeId = this.id;
      const params = {nodeId, jobId: this.jobId, jobPhaseId: this.jobPhaseId, sqlName: this.sqlName || null, resourceId: this.resourceId || null};
      this.isLoading = true;
      try {
        const data = this.type === 'output'
          ? (await this.$api.autoexec.job.getOutputNodeParam(params)).Return.operationOutputParamArray
          : (await this.$api.autoexec.job.getInputNodeParam(params)).Return.operationInputParamArray;
        if (nodeId === this.id) this.paramList = data || [];
      } finally {
        if (nodeId === this.id) this.isLoading = false;
      }
    },
    changeDownStatus(type, event) {
      //下载进度和状态的监听
      if (type == 'start') {
        this.downLoading = true;
      } else if (type != 'progress') {
        this.downLoading = false;
      }
    },
    runnerAction(action) {
      this.$emit('runnerAction', action);
    }
  },
  computed: {
    getDownurl() {
      let _this = this;
      return () => {
        let downConfig = this.$utils.deepClone(_this.downurl);
        downConfig.changeStatus = _this.changeDownStatus;
        return downConfig;
      };
    },
    downloadFile(row, path) {
      return (row, path) => {
        let data = {
          jobId: this.jobId,
          jobPhaseId: this.jobPhaseId,
          resourceId: this.resourceId,
          type: this.type,
          path: path
        };
        return {url: 'api/binary/autoexec/job/node/output/file/download', params: data, method: 'post', changeStatus: status => {
          if (status == 'start') {
            this.$set(row, 'isDownloadFileLoding', true);
          } else if (status == 'success' || status == 'error') {
            this.$set(row, 'isDownloadFileLoding', false);
          }
        }};
      };
    }
  },
  watch: {
    id(newValue, oldValue) {
      if (newValue != oldValue) {
        this.getData();
      }
    }
  }
};
</script>
