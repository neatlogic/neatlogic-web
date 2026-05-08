<!--定时作业-->
<template>
  <div class="jobManageList">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsContain border="border">
      <template slot="topLeft">
        <div class="action-group">
          <span v-if="currentTab === 'config'" class="action-item">
            <span class="text-action tsfont-plus" @click="addJob()">{{ $t('term.autoexec.timingjob') }}</span>
          </span>
          <span class="action-item">
            <span class="text-action tsfont-history" @click="showAudit()">{{ $t('term.autoexec.executionrecord') }}</span>
          </span>
          <span v-auth="['ADMIN']" class="action-item"><AuditConfig auditName="SCHEDULER-AUDIT"></AuditConfig></span>
        </div>
      </template>
      <template slot="topRight">
        <CombineSearcher v-model="searchVal" v-bind="currentSearchConfig" @change="handleSearchChange"></CombineSearcher>
      </template>
      <div slot="content">
        <Tabs v-model="currentTab" :animated="false" @on-click="changeTab">
          <TabPane label="配置作业" name="config"></TabPane>
          <TabPane label="已加载作业" name="memory"></TabPane>
        </Tabs>
        <TsTable
          v-if="currentTableData"
          :theadList="theadList"
          v-bind="currentTableData"
          hight="600"
          @changeCurrent="changePage"
          @changePageSize="changePageSize"
        >
          <template slot="isActive" slot-scope="{ row }">
            <span v-if="row.isMemoryJob">{{ row.jobStatus.stateName || '-' }}</span>
            <span v-else-if="row.isActive == 1" class="text-success">{{ $t('page.enable') }}</span>
            <span v-else class="text-grey">{{ $t('page.disable') }}</span>
          </template>
          <template slot="needAudit" slot-scope="{ row }">
            <span v-if="row.needAudit == 1" class="text-success">{{ $t('page.yes') }}</span>
            <span v-else class="text-grey">{{ $t('page.no') }}</span>
          </template>
          <template slot="moduleName" slot-scope="{ row }">
            <span>{{ row.moduleName || row.moduleId || '-' }}</span>
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
            <div>{{ getJobStatus(row).execCount || '-' }}</div>
          </template>
          <template slot="cron" slot-scope="{ row }">
            <div v-if="row.intervalInSeconds">
              <span class="text-grey">间隔</span><span class="text-bold">{{ row.intervalInSeconds }}s</span>
              <span v-if="row.repeatCount" class="ml-xs text-grey">重复</span><span v-if="row.repeatCount" class="text-bold">{{ row.repeatCount }}</span><span v-if="row.repeatCount" class="text-grey">次</span>
            </div>
            <div v-else>
              <TsQuartz :value="row.cron" showType="read" :transfer="true"></TsQuartz>
            </div>
          </template>
          <template slot="execute" slot-scope="{ row }">
            <div>
              <span class="text-grey">{{ $t('page.execcount') }}：</span>
              <span>{{ getJobStatus(row).execCount || '-' }}</span>
            </div>
            <div v-if="row.jobStatus.beginTime != null">
              <span class="text-grey">{{ $t('page.planstarttime') }}：</span>
              <span>{{ row.jobStatus.beginTime | formatDate }}</span>
            </div>
            <div v-if="row.jobStatus.endTime != null">
              <span class="text-grey">{{ $t('page.planendtime') }}：</span>
              <span>{{ row.jobStatus.endTime | formatDate }}</span>
            </div>
            <div v-if="getJobStatus(row).lastFireTime != null">
              <span class="text-grey">{{ $t('term.autoexec.lastactivetime') }}：</span>
              <span>{{ getJobStatus(row).lastFireTime | formatDate }}</span>
            </div>
            <div v-if="getJobStatus(row).lastFinishTime != null">
              <span class="text-grey">{{ $t('term.autoexec.lastcompletetime') }}：</span>
              <span>{{ getJobStatus(row).lastFinishTime | formatDate }}</span>
            </div>
            <div v-if="getJobStatus(row).nextFireTime != null">
              <span class="text-grey">{{ $t('page.nextactivationtime') }}：</span>
              <span>{{ getJobStatus(row).nextFireTime | formatDate }}</span>
            </div>
          </template>
          <template slot="name" slot-scope="{ row }">
            <span v-if="row.isMemoryJob">{{ row.name }}</span>
            <span v-else class="text-href" @click.stop="editRow(row.uuid)">{{ row.name }}</span>
          </template>
          <template slot="action" slot-scope="{ row }">
            <span v-if="row.isMemoryJob" class="text-grey">-</span>
            <div v-else class="tstable-action">
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
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    JobAudit: () => import('./job-audit-dialog.vue'),
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
      currentTab: 'config',
      currentJobUuid: null,
      isAuditShow: false,
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
          title: this.$t('term.framework.belongmodule'),
          key: 'moduleName'
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
      memoryTableData: null,
      clientHeight: document.documentElement.clientHeight, //窗口高度
      searchParam: {
        currentPage: 1,
        pageSize: this.pageSize
      },
      memorySearchParam: {
        currentPage: 1,
        pageSize: this.pageSize
      },
      jobStateMap: {
        NORMAL: '正常',
        PAUSED: '暂停',
        COMPLETE: '完成',
        ERROR: '错误',
        BLOCKED: '阻塞',
        NONE: '不存在'
      },
      searchConfig: {
        search: true,
        labelPosition: 'left',
        placeholder: this.$t('page.insert') + this.$t('page.name'),
        searchList: [
          {
            type: 'select',
            name: 'handler',
            label: this.$t('term.autoexec.jobmodule'),
            search: true,
            dynamicUrl: '/api/rest/job/class/all/search',
            rootName: 'tbodyList',
            valueName: 'className',
            textName: 'name',
            transfer: true
          },
          {
            type: 'select',
            name: 'moduleId',
            label: this.$t('term.framework.belongmodule'),
            url: '/api/rest/module/list',
            valueName: 'value',
            textName: 'text',
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
    showAudit(jobUuid) {
      this.isAuditShow = true;
      this.currentJobUuid = jobUuid;
    },
    changeTab(tab) {
      if (tab) {
        this.currentTab = tab;
      }
      if (this.searchVal.status !== undefined && this.searchVal.status !== null && this.searchVal.status !== '') {
        this.searchVal = {
          ...this.searchVal,
          status: null
        };
      }
      this.searchCurrentTab(1);
    },
    handleSearchChange() {
      this.searchCurrentTab(1);
    },
    searchCurrentTab(currentPage, pageSize) {
      if (this.currentTab === 'memory') {
        this.searchMemoryJob(currentPage, pageSize);
      } else {
        this.searchJob(currentPage, pageSize);
      }
    },
    changePage(currentPage) {
      this.searchCurrentTab(currentPage);
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
      _this.searchParam.moduleId = _this.searchVal.moduleId || null;
      _this.searchParam.isActive = this.getSearchValue('status');
      _this.searchParam.needAudit = this.getSearchValue('needAudit');
      this.loadingShow = true;
      this.$api.framework.schedule.search(_this.searchParam).then(res => {
        if (res.Status == 'OK') {
          _this.tabledata = res.Return;
        }
      }).finally(() => {
        _this.loadingShow = false;
      });
    },
    searchMemoryJob(currentPage, pageSize) {
      if (currentPage) {
        this.memorySearchParam.currentPage = currentPage;
      }
      if (pageSize) {
        this.memorySearchParam.pageSize = pageSize;
      } else {
        this.memorySearchParam.pageSize = this.pageSize;
      }
      this.memorySearchParam.keyword = this.searchVal.keyword || this.searchVal.searchWord || null;
      this.memorySearchParam.handler = this.searchVal.handler || null;
      this.memorySearchParam.moduleId = this.searchVal.moduleId || null;
      this.memorySearchParam.state = this.getSearchValue('status');
      this.memorySearchParam.needAudit = this.getSearchValue('needAudit');
      this.loadingShow = true;
      this.$api.framework.schedule.searchMemoryJob(this.memorySearchParam).then(res => {
        if (res.Status == 'OK') {
          this.memoryTableData = this.normalizeMemoryTableData(res.Return);
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    normalizeMemoryTableData(data) {
      const tenant = data.tenant || '';
      const tenantPrefix = tenant ? tenant + '-' : '';
      const tbodyList = (data.tbodyList || []).map(row => {
        const name = this.trimTenantPrefix(row.jobName, tenantPrefix);
        const jobGroup = this.trimTenantPrefix(row.jobGroup, tenantPrefix);
        return {
          ...row,
          name: name,
          handlerName: row.jobHandlerName || this.getJobHandlerSimpleName(row.jobHandler),
          handler: row.jobHandler,
          moduleId: row.moduleId,
          moduleName: row.moduleName,
          isActive: 1,
          isMemoryJob: true,
          jobStatus: {
            isLoad: 1,
            execCount: row.execCount,
            beginTime: row.beginTime,
            endTime: row.endTime,
            lastFireTime: row.lastFireTime,
            lastFinishTime: row.lastFinishTime,
            nextFireTime: row.nextFireTime,
            state: row.state,
            stateName: row.stateName,
            jobGroup: jobGroup
          }
        };
      });
      return {
        ...data,
        tbodyList: tbodyList
      };
    },
    trimTenantPrefix(value, tenantPrefix) {
      if (!value || !tenantPrefix || !value.startsWith(tenantPrefix)) {
        return value;
      }
      return value.substring(tenantPrefix.length);
    },
    getJobHandlerSimpleName(handler) {
      if (!handler) {
        return '-';
      }
      const index = handler.lastIndexOf('.');
      return index > -1 ? handler.substring(index + 1) : handler;
    },
    getJobStatus(row) {
      return row.jobStatus || {};
    },
    getSearchValue(name) {
      const value = this.searchVal[name];
      return value === undefined || value === null || value === '' ? null : value;
    },
    //改变页数
    changePageSize(pageSize) {
      this.pageSize = pageSize;
      this.searchCurrentTab(1, pageSize);
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
                this.searchCurrentTab(1);
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
                this.searchCurrentTab(1);
              }
            });
        }
      });
    }
  },

  computed: {
    currentSearchConfig() {
      const statusList = this.currentTab === 'memory'
        ? Object.keys(this.jobStateMap).map(key => ({ value: key, text: this.jobStateMap[key] }))
        : [
          { value: 1, text: this.$t('page.enable') },
          { value: 0, text: this.$t('page.disable') }
        ];
      return {
        ...this.searchConfig,
        searchList: [
          ...this.searchConfig.searchList,
          {
            type: 'radio',
            name: 'status',
            label: this.$t('page.status'),
            dataList: statusList,
            transfer: true,
            allowToggle: true
          },
          {
            type: 'radio',
            name: 'needAudit',
            label: this.$t('page.keeprecords'),
            dataList: [
              { value: 1, text: this.$t('page.yes') },
              { value: 0, text: this.$t('page.no') }
            ],
            transfer: true,
            allowToggle: true
          }
        ]
      };
    },
    currentTableData() {
      return this.currentTab === 'memory' ? this.memoryTableData : this.tabledata;
    },
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
