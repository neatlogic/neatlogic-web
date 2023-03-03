<template>
  <div>
    <TsDialog
      v-bind="dialogConfig"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <Loading v-if="isLoading" :loadingShow="isLoading" type="fix"></Loading>
          <div class="clearfix">
            <div class="mb-nm float-right" style="width:50%">
              <CombineSearcher
                v-model="searchParam"
                v-bind="searchConfig"
                @change="searchAudit(1)"
              ></CombineSearcher>
            </div>
          </div>
          <TsTable
            v-if="auditTableData"
            :theadList="theadList"
            v-bind="auditTableData"
            :fixedHeader="false"
            @changeCurrent="changePage"
          >
            <template slot="status" slot-scope="{ row }">
              <div>
                <span v-if="row.status == 'succeed'" class="text-success">成功</span>
                <span v-else-if="row.status == 'failed'" class="text-error">失败</span>
                <span v-else-if="row.status == 'running'" class="text-info">进行中</span>
                <span v-else>-</span>
              </div>
            </template>
            <template slot="startTime" slot-scope="{ row }">
              <span v-if="row.startTime">{{ row.startTime | formatDate }}</span>
              <span v-else>-</span>
            </template>
            <template slot="endTime" slot-scope="{ row }">
              <span v-if="row.endTime">{{ row.endTime | formatDate }}</span>
              <span v-else>-</span>
            </template>
            <template slot="nextFireTime" slot-scope="{ row }">
              <span v-if="row.nextFireTime">{{ row.nextFireTime | formatDate }}</span>
              <span v-else>-</span>
            </template>
            <template slot="contentHash" slot-scope="{ row }">
              <div v-if="row.contentHash">
                <a href="javascript:void(0);" @click="showLog(row.id)">查看</a>
              </div>
              <div v-else>无</div>
            </template>
          </TsTable>
        </div>
      </template>
    </TsDialog>
    <LogDialog v-if="isLogShow" :auditId="currentAuditId" @close="closeLogDialog"></LogDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    LogDialog: resolve => require(['./job-log-dialog.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    CombineSearcher: resolve => require(['@/resources/components/CombineSearcher/CombineSearcher.vue'], resolve)
  },
  props: {
    jobUuid: {type: String}
  },
  data() {
    return {
      isLoading: false,
      isLogShow: false,
      currentAuditId: null,
      searchConfig: {
        labelWidth: 100,
        searchList: [
          {
            type: 'select',
            name: 'status',
            label: '状态',
            transfer: true,
            dataList: [{value: 'succeed', text: '成功'}, {value: 'failed', text: '失败'}, {value: 'running', text: '进行中'}]
          },
          {
            type: 'timeselect',
            name: 'startTimeRange',
            label: '时间范围',
            transfer: true
          }
        ]
      },
      searchParam: {
        keyword: '',
        jobUuid: this.jobUuid,
        status: '',
        currentPage: 1,
        pageSize: 20
      },
      auditTableData: null, //执行日志列表
      theadList: [
        //日志table
        {
          title: '状态',
          key: 'status'
        },
        {
          title: '开始时间',
          key: 'startTime'
        },
        {
          title: '结束时间',
          key: 'endTime'
        },
        {
          title: 'cron',
          key: 'cron'
        },
        {
          title: '下一次激活时间',
          key: 'nextFireTime'
        },
        {
          title: '日志',
          key: 'contentHash'
        },
        {
          title: '服务器ID',
          key: 'serverId'
        }
      ],
      dialogConfig: {
        type: 'modal',
        title: '执行日志',
        hasFooter: false,
        maskClose: true,
        isShow: true,
        width: 'large'
      }
    };
  },
  beforeCreate() {},
  created() {
    if (!this.jobUuid) {
      this.theadList.unshift({title: '作业', key: 'jobUuid'});
    }
    this.searchAudit();
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
    closeLogDialog() {
      this.isLogShow = false;
    },
    showLog(id) {
      this.isLogShow = true;
      this.currentAuditId = id;
    },
    closeDialog() {
      this.$emit('close');
    },
    changePage: function(currentPage) {
      this.searchAudit(currentPage);
    },
    searchAudit: function(currentPage) {
      //执行作业日志列表
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      this.isLoading = true;
      this.$api.framework.schedule
        .auditSearch(this.searchParam)
        .then(res => {
          if (res.Status == 'OK') {
            this.auditTableData = res.Return;
          }
        }).finally(() => {
          this.isLoading = false;
        });
    }
  },
  filter: {},
  computed: {},
  watch: {
  }
};
</script>
<style lang="less">
</style>
