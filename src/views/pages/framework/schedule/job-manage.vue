<!--定时作业-->
<template>
  <div class="jobManageList">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsContain border="border">
      <template slot="topLeft">
        <div class="action-group">
          <span class="action-item">
            <span class="text-action tsfont-plus" @click="addJob()">{{ $t('term.autoexec.timingjob') }}</span>
          </span>
          <span class="action-item">
            <span class="text-action tsfont-history" @click="showAudit()">{{ $t('term.autoexec.executionrecord') }}</span>
          </span>
          <span class="action-item">
            <span class="text-action tsfont-timer" @click="showSchedulerMemoryJob()">{{ $t('term.autoexec.loadedjob') }}</span>
          </span>
          <span v-auth="['ADMIN']" class="action-item"><AuditConfig auditName="SCHEDULER-AUDIT"></AuditConfig></span>
        </div>
      </template>
      <template slot="topRight">
        <CombineSearcher v-model="searchVal" v-bind="searchConfig" @change="searchJob(1)"></CombineSearcher>
      </template>
      <div slot="content">
        <TsTable
          v-if="tabledata"
          v-bind="tabledata"
          hight="600"
          @changeCurrent="changePage"
          @changePageSize="changePageSize"
        >
          <template slot="isActive" slot-scope="{ row }">
            <span v-if="row.isActive == 1" class="text-success">{{ $t('page.enable') }}</span>
            <span v-else class="text-grey">{{ $t('page.disable') }}</span>
          </template>
          <template slot="needAudit" slot-scope="{ row }">
            <span v-if="row.needAudit == 1" class="text-success">{{ $t('page.yes') }}</span>
            <span v-else class="text-grey">{{ $t('page.no') }}</span>
          </template>
          <template slot="isLoad" slot-scope="{ row }">
            <span v-if="row.jobStatus && row.jobStatus.isLoad == 1" class="text-success">
              <Poptip :transfer="true" placement="right" trigger="hover">
                {{ $t('page.yes') }}
                <div slot="content">
                  <div v-if="row.jobStatus && row.jobStatus.jobLoadList" class="action-group">
                    <div v-for="jobLoad in row.jobStatus.jobLoadList" :key="jobLoad.serverId" class="action-item">
                      <span class="mr-xs text-grey">{{ $t('term.process.catalog') + jobLoad.serverId }}</span>
                      <span v-if="jobLoad && jobLoad.isLoad == 1" class="text-success">{{ $t('page.yes') }}</span>
                      <span v-else class="text-grey">{{ $t('page.no') }}</span>
                    </div>
                  </div>
                </div>
              </Poptip>
            </span>
            <span v-else class="text-grey">{{ $t('page.no') }}</span>
          </template>
          <template slot="execCount" slot-scope="{ row }">
            <div>{{ row.jobStatus.execCount }}</div>
          </template>
          <template slot="cron" slot-scope="{ row }">
            <div>
              <TsQuartz :value="row.cron" showType="read"></TsQuartz>
            </div>
          </template>
          <template slot="execute" slot-scope="{ row }">
            <div>
              <span class="text-grey">{{ $t('page.execcount') }}：</span>
              <span>{{ row.jobStatus.execCount || '0' }}</span>
            </div>
            <div v-if="row.jobStatus.beginTime != null">
              <span class="text-grey">{{ $t('term.autoexec.planstarttime') }}：</span>
              <span>{{ row.jobStatus.beginTime | formatDate }}</span>
            </div>
            <div v-if="row.jobStatus.endTime != null">
              <span class="text-grey">{{ $t('term.autoexec.planendtime') }}：</span>
              <span>{{ row.jobStatus.endTime | formatDate }}</span>
            </div>
            <div v-if="row.jobStatus.lastFireTime != null">
              <span class="text-grey">{{ $t('term.autoexec.lastactivetime') }}：</span>
              <span>{{ row.jobStatus.lastFireTime | formatDate }}</span>
            </div>
            <div v-if="row.jobStatus.lastFinishTime != null">
              <span class="text-grey">{{ $t('term.autoexec.lastcompletetime') }}：</span>
              <span>{{ row.jobStatus.lastFinishTime | formatDate }}</span>
            </div>
            <div v-if="row.jobStatus.nextFireTime != null">
              <span class="text-grey">{{ $t('page.nextactivationtime') }}：</span>
              <span>{{ row.jobStatus.nextFireTime | formatDate }}</span>
            </div>
          </template>
          <template slot="name" slot-scope="{ row }"><span class="text-href" @click.stop="editRow(row.uuid)">{{ row.name }}</span></template>
          <template slot="action" slot-scope="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li
                  class="tsfont-test icon"
                  :title="
                    row.isActive === 1
                      ? '禁用才能测试'
                      : ''
                  "
                  :class="{ disable: row.isActive == 1 }"
                  @click="testRow(row, row.handler)"
                >{{ $t('page.test') }}</li>
                <li class="tsfont-copy icon" @click="copyRow(row.uuid,row.handler,row.group)">{{ $t('page.copy') }}</li>
                <!-- <li class="tsfont-edit icon" @click="editRow(row.uuid)">{{ $t('page.edit') }}</li> -->
                <li class="tsfont-trash-o icon" @click="deleteRow(row.uuid, row.name)">{{ $t('page.delete') }}</li>
                <li class="tsfont-history" @click="showAudit(row.uuid)">{{ $t('term.autoexec.executionrecord') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </div>
    </TsContain>
    <JobEdit
      v-if="isEditShow"
      :jobUuid="currentJobUuid"
      :isCopy="isCopy"
      @close="closeEditDialog"
    ></JobEdit>
    <JobAudit v-if="isAuditShow" :jobUuid="currentJobUuid" @close="closeAuditDialog"></JobAudit>
    <schedulerMemory v-if="isSchedulerMemoryShow" @close="closeSchedulerMemory"></schedulerMemory>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    JobAudit: () => import('./job-audit-dialog.vue'),
    schedulerMemory: () => import('./job-memory.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    TsQuartz: () => import('@/resources/plugins/TsQuartz/TsQuartz.vue'),
    CombineSearcher: () => import('@/resources/components/CombineSearcher/CombineSearcher.vue'),
    AuditConfig: () => import('@/views/components/auditconfig/auditconfig.vue'),
    JobEdit: () => import('./job-edit-dialog.vue')
  },
  filters: {
  },
  props: [''],
  data() {
    return {
      isCopy: false,
      currentJobUuid: null,
      isAuditShow: false,
      isSchedulerMemoryShow: false,
      isEditShow: false,
      isSaving: false,
      loadingShow: false,
      tableheight: 0,
      auditTableHeight: 0,
      pageSize: 20,
      searchVal: {},
      theadList: [
        {
          title: this.$t('page.name'),
          key: 'name'
        },
        {
          title: this.$t('term.autoexec.jobmodule'),
          key: 'handlerName'
        },
        {
          title: this.$t('page.status'),
          key: 'isActive'
        },
        {
          title: this.$t('page.keeprecords'),
          key: 'needAudit'
        },
        {
          title: this.$t('page.loaded'),
          key: 'isLoad'
        },
        {
          title: this.$t('page.plantime'),
          key: 'cron'
        },
        {
          title: this.$t('term.autoexec.executionsituation'),
          key: 'execute'
        },
        {
          title: this.$t('term.autoexec.executecount'),
          key: 'execCount'
        },
        {
          title: ' ',
          key: 'action',
          width: 10,
          align: 'right'
        }
      ],
      tabledata: null,
      clientHeight: document.documentElement.clientHeight, //窗口高度
      searchParam: {
        currentPage: 1,
        pageSize: this.pageSize
      },
      searchConfig: {
        search: true,
        placeholder: this.$t('page.insert') + this.$t('page.name'),
        searchList: [
          {
            type: 'select',
            name: 'handler',
            label: this.$t('term.autoexec.jobmodule'),
            search: true,
            url: '/api/rest/job/class/search',
            rootName: 'tbodyList',
            valueName: 'className',
            textName: 'name',
            transfer: true
          }
        ]
      },
      propData: []
    };
  },
  beforeMount() {},
  mounted() {
    this.searchJob(1);
  },
  created() {},
  beforeDestroy() {
  },
  methods: {
    closeEditDialog(needRefresh) {
      this.isEditShow = false;
      this.isCopy = false;
      this.currentJobUuid = null;
      if (needRefresh) {
        this.searchJob(1);
      }
    },
    closeAuditDialog() {
      this.isAuditShow = false;
      this.currentJobUuid = null;
    },
    closeSchedulerMemory() {
      this.isSchedulerMemoryShow = false;
    },
    showAudit(jobUuid) {
      this.isAuditShow = true;
      this.currentJobUuid = jobUuid;
    },
    showSchedulerMemoryJob() {
      this.isSchedulerMemoryShow = true;
    },
    changePage(currentPage) {
      this.searchJob(currentPage);
    },
    //获取所有定时作业
    searchJob: function(currentPage, pageSize) {
      let _this = this;
      if (currentPage) {
        _this.searchParam.currentPage = currentPage;
      }
      if (pageSize) {
        _this.searchParam.pageSize = pageSize;
      } else {
        _this.searchParam.pageSize = this.pageSize;
      }
      _this.searchParam.keyword = _this.searchVal.keyword || _this.searchVal.searchWord || null;
      _this.searchParam.handler = _this.searchVal.handler || null;
      this.$api.framework.schedule.search(_this.searchParam).then(res => {
        if (res.Status == 'OK') {
          _this.loadingShow = false;
          _this.tabledata = res.Return;
          _this.tabledata.theadList = _this.theadList;
        }
      });
    },
    //改变页数
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchJob(1);
    },
    addJob: function() {
      this.isCopy = false;
      this.currentJobUuid = null;
      this.isEditShow = true;
    },
    editRow: function(uuid) {
      this.isCopy = false;
      this.currentJobUuid = uuid;
      this.isEditShow = true;
    },
    copyRow: function(uuid) {
      this.isCopy = true;
      this.currentJobUuid = uuid;
      this.isEditShow = true;
    },
    deleteRow: function(uuid, name) {
      //删除定时作业
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deletetargetconfirm', {target: name}),
        btnType: 'error',
        'on-ok': vnode => {
          vnode.isShow = false;
          let params = { uuid: uuid };
          this.$api.framework.schedule
            .delete(params)
            .then(res => {
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.deletesuccess'));
                this.searchJob(1);
              }
            });
        }
      });
    },
    testRow: function(row, handler) {
      if (row.isActive == 1) {
        return;
      }
      this.$createDialog({
        title: this.$t('dialog.title.testconfirm'),
        content: this.$t('dialog.content.testconfirm', {target: row.name}),
        btnType: 'primary',
        'on-ok': vnode => {
          vnode.isShow = false;
          let params = { jobUuid: row.uuid, jobHandlerClassName: handler};
          this.$api.framework.schedule
            .test(params)
            .then(res => {
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.executesuccess'));
                this.searchJob(1);
              }
            });
        }
      });
    }
  },

  computed: {
    scrollheight: function() {
      let height = this.clientHeight - 60;
      return height;
    }
  },
  watch: {}
};
</script>
<style lang="less">
.jobManageList {
  .top {
    .bar-top {
      .bar-top-left {
        .batch {
          margin-left: 16px;
        }
      }
    }
  }

  .job-box {
    // min-height: calc(100vh - 58px - 16px - 16px - 22px);
    .job-top {
      margin-bottom: 16px;
    }
  }
  .clickMore {
    text-align: center;
    width: 100%;
    height: 24px;
    line-height: 24px;
    margin: 10px 0;
    span {
      cursor: pointer;
    }
  }
  .textMore {
    text-align: center;
    width: 100%;
    height: 24px;
    line-height: 24px;
    margin: 10px 0;
  }
  tr {
    cursor: default;
  }
}
</style>
<style lang="less">
.propTable {
  position: relative;
  .addProp {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 100;
  }
}
</style>
