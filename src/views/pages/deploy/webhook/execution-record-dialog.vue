<template>
  <div>
    <Loading
      :loadingShow="loadingShow"
      type="fix"
    ></Loading>
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
            <template slot="name" slot-scope="{row}">
              <span v-if="row && row.name" class="text-href" @click.stop="toJobDetail(row)">{{ row.name }}</span>
            </template>
            <template slot="status" slot-scope="{row}">
              <CommonStatus
                v-if="row && row.status && row.statusName"
                :statusValue="row.status"
                :statusName="row.statusName"
                type="text"
              ></CommonStatus>
            </template>
            <template slot="action" slot-scope="{row}">
              <div class="tstable-action">
                <ul class="tstable-action-ul">
                  <li class="tsfont-rizhishoujiyufenxixitong" @click.stop="openInputParam(row)">{{ $t('page.inputparam') }}</li>
                  <li class="tsfont-rizhishoujiyufenxixitong" @click.stop="openOutputParam(row)">{{ $t('page.outputparam') }}</li>
                </ul>
              </div>
            </template>
          </TsTable>
        </div>
      </template>
    </TsDialog>
    <ViewParamDialog
      v-if="isShowViewParamDialog"
      :filePath="filePath"
      :title="viewParamTitle"
      @close="isShowViewParamDialog = false"
    ></ViewParamDialog>
  </div>
</template>
<script>
export default {
  name: '', // 执行记录
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    CommonStatus: resolve => require(['@/resources/components/Status/CommonStatus.vue'], resolve),
    ViewParamDialog: resolve => require(['./view-param-dialog'], resolve) // 输入、输出参数结果查看
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    id: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      loadingShow: true,
      isShowViewParamDialog: false,
      viewParamTitle: '',
      filePath: '', // 执行记录，输入输出文件路径
      dialogSetting: {
        title: this.title,
        type: 'slider',
        width: 'medium',
        isShow: true,
        hasFooter: false
      },
      searchParam: {
        currentPage: 1,
        pageSize: 20
      },
      theadList: [
        {title: this.$t('term.autoexec.jobname'), key: 'name'},
        {title: this.$t('term.autoexec.executionresult'), key: 'status'},
        {title: this.$t('page.triggertime'), key: 'lcd', type: 'time' },
        {key: 'action'}
      ],
      tableConfig: {
        tbodyList: []
      }
    };
  },
  beforeCreate() {},
  created() {
    if (this.id) {
      this.searchParam.webhookId = this.id;
      this.searchExecuteRecord(1);
    } else {
      this.loadingShow = false;
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
    closeDialog() {
      this.$emit('close');
    },
    changeCurrent(currentPage) {
      this.searchExecuteRecord(currentPage);
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchExecuteRecord(1);
    },
    searchExecuteRecord(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      this.loadingShow = true;
      this.$api.deploy.webhook.getWebhookAuditList(this.searchParam).then((res) => {
        if (res && res.Status == 'OK') {
          this.tableConfig = res.Return;
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    toJobDetail(row) {
      if (row && row.fromJobId) {
        window.open(HOME + '/deploy.html#/job-detail?id=' + row.fromJobId, '_blank');
      }
    },
    openInputParam(row) {
      this.isShowViewParamDialog = true;
      this.viewParamTitle = this.$t('page.inputparam');
      this.filePath = row && row.paramFilePath ? row.paramFilePath : (row.errorFilePath || '');
    },
    openOutputParam(row) {
      this.isShowViewParamDialog = true;
      this.viewParamTitle = this.$t('page.outputparam');
      this.filePath = row && row.resultFilePath ? row.resultFilePath : (row.errorFilePath || '');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
