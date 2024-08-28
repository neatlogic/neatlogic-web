<template>
  <div>
    <TsDialog
      v-bind="dialogSetting"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <TsTable
            :theadList="theadList"
            v-bind="tableConfig"
            @changeCurrent="changeCurrent"
            @changePageSize="changePageSize"
          >
            <template slot="status" slot-scope="{row}">
              <Status
                v-if="row.status"
                type="text"
                :statusName="row.statusName"
                :statusValue="row.status"
              ></Status>
            </template>
            <template slot="jobName" slot-scope="{row}">
              <span v-if="row.action=='create_job'" class="text-href" @click="toJobDetail(row)">{{ row ? row.jobName : '' }}</span>
              <span v-else-if="row.action == 'create_batch_job'" class="text-href" @click="toBatchJobDetail(row)">{{ row ? row.jobName : '' }}</span>
            </template>
            <template slot="action" slot-scope="{ row }">
              <div class="tstable-action">
                <ul class="tstable-action-ul">
                  <li class="tsfont-file-single" @click="viewLogDetail(row)">{{ $t('page.logdetails') }}</li>
                </ul>
              </div>
            </template>
          </TsTable>
        </div>
      </template>
    </TsDialog>

    <!-- 日志详情 -->
    <LogDetailDialog v-if="isShowLogDetail" :filePath="resultFilePath" @close="closeLogDetail"></LogDetailDialog>
  </div>
</template>
<script>
export default {
  name: '', // 执行记录
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    Status: () => import('@/resources/components/Status/CommonStatus.vue'),
    LogDetailDialog: () => import('./log-detail-dialog')
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    ciId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      dialogSetting: {
        isShow: true,
        hasFooter: false,
        type: 'slider',
        width: 'large',
        title: this.title
      },
      resultFilePath: '', // 日志详情查询，文件路径
      isShowLogDetail: false,
      searchParam: {},
      tableConfig: {
        tbodyList: []
      },
      theadList: [
        {
          title: this.$t('term.deploy.commitid'),
          key: 'commitId'
        },
        {
          title: this.$t('page.triggeraction'),
          key: 'actionName'
        },
        {
          title: this.$t('page.status'),
          key: 'status'
        },
        {
          title: this.$t('term.autoexec.jobname'),
          key: 'jobName'
        },
        {
          title: this.$t('page.triggertime'),
          key: 'fcd',
          type: 'time'
        },
        {
          key: 'action'
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    if (this.ciId) {
      this.searchExecuteRecord(1);
    }
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
    changeCurrent(currentPage) {
      this.searchExecuteRecord(currentPage);
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchExecuteRecord(1);
    },
    closeDialog() {
      this.$emit('close');
    },
    searchExecuteRecord(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      this.$api.deploy.integrated.getExecuteRecordList({ciId: this.ciId, ...this.searchParam}).then(res => {
        if (res && res.Status == 'OK') {
          this.tableConfig = res.Return;
        }
      });
    },
    toJobDetail(row) {
      // 单个作业详情
      if (row && row.jobId) {
        window.open(HOME + '/deploy.html#/job-detail?id=' + row.jobId, '_blank');
      }
    },
    toBatchJobDetail(row) {
      if (row && row.jobId) {
        window.open(HOME + '/deploy.html#/batch-job-detail?id=' + row.jobId, '_blank');
      }
    },
    viewLogDetail(row) {
      // 日志详情
      this.resultFilePath = (row && row.status == 'succeed') ? row.resultFilePath : row.errorFilePath;
      this.isShowLogDetail = true;
    },
    closeLogDetail() {
      this.resultFilePath = '';
      this.isShowLogDetail = false;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
