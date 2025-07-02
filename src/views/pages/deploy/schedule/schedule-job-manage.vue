<template>
  <div>
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsContain enableCollapse :siderWidth="220">
      <template v-slot:topLeft>
        <span class="tsfont-plus text-action" @click="addTimeJob">{{ $t('term.autoexec.timingjob') }}</span>
      </template>
      <template v-slot:topRight>
        <div>
          <InputSearcher
            v-model="searchValue.keyword"
            @change="searchSchedule(1)"
          ></InputSearcher>
        </div>
      </template>
      <template v-slot:sider>
        <div>
          <AppModuleList
            ref="appModuleList"
            v-model="appModuleData"
            :filter="{authorityActionList: ['view']}"
          ></AppModuleList>
        </div>
      </template>
      <template v-slot:content>
        <div>
          <TsTable
            v-bind="scheduleData"
            :theadList="theadList"
            @changeCurrent="searchSchedule"
            @changePageSize="changePageSize"
          >
            <template v-slot:name="{ row }">
              <span class="text-href" @click="toJobDetail(row)">
                {{ row.name }}
              </span>
            </template>
            <template v-slot:isActive="{ row }">
              <span v-if="row.isActive">{{ $t('page.enable') }}</span>
              <span v-else>{{ $t('page.disable') }}</span>
            </template>
            <template slot="isLoad" slot-scope="{ row }">
              <span v-if="row.jobStatus && row.jobStatus.isLoad == 1" class="text-success">{{ $t('page.yes') }}</span>
              <span v-else class="text-grey">{{ $t('page.no') }}</span>
            </template>
            <template slot="cron" slot-scope="{ row }">
              <div>
                <TsQuartz :value="row.cron" showType="read"></TsQuartz>
              </div>
            </template>
            <template v-slot:beginTime="{ row }">
              <div v-if="row.beginTime" class="fz10">
                <span>{{ row.beginTime | formatDate }}</span>
                <span class="text-grey ml-xs">{{ $t('page.begin') }}</span>
              </div>
              <div v-if="row.endTime" class="fz10">
                <span>{{ row.endTime | formatDate }}</span>
                <span class="text-grey ml-xs">{{ $t('page.finish') }}</span>
              </div>
            </template>
            <template v-slot:appSystemAbbrName="{ row }">
              <div>
                {{ row.appSystemAbbrName }}<template v-if="row.appModuleAbbrName">/{{ row.appModuleAbbrName }}</template>
              </div>
            </template>
            <template v-slot:pipelineName="{ row }">
              <div v-if="row.pipelineName" class="text-href" @click="gotoPipeline(row)">
                {{ row.pipelineName }}
              </div>
            </template>
            <template v-slot:execCount="{ row }">
              <div :class="row.execCount>0?'text-href':''" @click="showJobList(row)">
                {{ row.execCount }}
              </div>
            </template>
            <template slot="jobStatus" slot-scope="{ row }">
              <div v-if="!$utils.isEmpty(row.jobStatus)">
                <div>
                  <span class="text-grey">{{ $t('term.autoexec.starttoexecute') }}</span>
                  <span>{{ row.jobStatus.execCount || '0' }}次</span>
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
              </div>
            </template>
            <template v-slot:action="{ row }">
              <div class="tstable-action">
                <ul class="tstable-action-ul">
                  <li :title="!row.editable ? $t('page.notauthrelationadmin'): ''" @click.stop>
                    <TsFormSwitch
                      v-model="row.isActive"
                      :true-value="1"
                      :false-value="0"
                      showStatus
                      :disabled="!row.editable ? true : false"
                      @on-change="updateSchedule(row)"
                    ></TsFormSwitch>
                  </li>
                  <li
                    class="tsfont-test icon"
                    :title="
                      !row.editable
                        ? $t('page.notauthrelationadmin')
                        : row.isActive === 1
                          ? '禁用才能测试'
                          : ''
                    "
                    :class="{ disable: !row.editable || row.isActive == 1}"
                    @click.stop="testRow(row, jobHandler)"
                  >{{ $t('page.test') }}</li>
                  <li
                    class="tsfont-trash-o"
                    :title="!row.deletable ? $t('page.notauthrelationadmin'):''"
                    :class="{ disable: !row.deletable }"
                    @click.stop="deleteSchedule(row)"
                  >
                    {{ $t('page.delete') }}
                  </li>
                  <li
                    class="tsfont-putongjigui"
                    :title="$t('term.deploy.jobrecord')"
                    @click="showJobList(row)"
                  >
                    <!-- 执行记录 -->
                    {{ $t('term.deploy.jobrecord') }}
                  </li>
                  <li
                    class="tsfont-putongjigui"
                    :title="$t('term.autoexec.executionrecord')"
                    @click="showAudit(row)"
                  >
                    <!-- 执行记录 -->
                    {{ '执行记录' }}
                  </li>
                </ul>
              </div>
            </template>
          </TsTable>
        </div>
      </template>
    </TsContain>
    <ListDeployJobDialog v-if="isListDeployJobDialogShow" :invokeIdList="invokeIdList" @close="closeListJob"></ListDeployJobDialog>
    <JobAudit v-if="isAuditShow" :jobUuid="currentJobUuid" @close="closeAuditDialog"></JobAudit>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue'),
    AppModuleList: () => import('../application-config/config/app/app-module-list.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    TsQuartz: () => import('@/resources/plugins/TsQuartz/TsQuartz.vue'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    ListDeployJobDialog: () => import('@/views/pages/deploy/pipeline/list-deployjob-dialog.vue'),
    JobAudit: () => import('../../framework/schedule/job-audit-dialog.vue')
  },
  props: {},
  data() {
    return {
      loadingShow: true,
      searchParam: {},
      searchValue: {
        keyword: ''
      },
      appModuleData: null,
      scheduleData: {},
      theadList: [
        {
          title: this.$t('page.name'),
          key: 'name'
        },
        {
          title: this.$t('page.status'),
          key: 'isActive'
        },
        {
          title: this.$t('page.loaded'),
          key: 'isLoad'
        },
        {
          title: this.$t('term.autoexec.timingplan'),
          key: 'cron'
        },
        {
          title: this.$t('page.startstoptime'),
          key: 'beginTime'
        },
        {
          title: this.$t('term.deploy.jobtype'),
          key: 'typeName'
        },
        {
          title: this.$t('term.deploy.superpipeline'),
          key: 'pipelineName'
        },
        {
          title: this.$t('term.deploy.appmodule'),
          key: 'appSystemAbbrName'
        },
        {
          title: this.$t('term.deploy.jobcount'),
          key: 'execCount'
        },
        {
          title: this.$t('page.fcu'),
          key: 'lcuVo',
          type: 'user'
        },
        {
          title: this.$t('page.fcd'),
          key: 'lcd',
          type: 'time'
        },
        {
          title: this.$t('term.autoexec.executionsituation'),
          key: 'jobStatus'
        },
        { key: 'action' }
      ],
      isListDeployJobDialogShow: false,
      invokeIdList: [],
      jobHandler: null,
      isAuditShow: false
    };
  },
  beforeCreate() {},
  created() {
    if (this.$route.query && !this.$route.query.isBack) {
      this.$addHistoryData('appModuleEnvData', {});
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
    searchSchedule(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      this.$api.deploy.schedule.searchSchedule({...this.searchParam, ...this.searchValue}).then(res => {
        if (res.Status == 'OK') {
          this.scheduleData = res.Return;
          this.jobHandler = res.Return.handler;
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchSchedule(1);
    },
    addTimeJob() {
      let params = {
        path: '/schedule-job-add',
        query: {}
      };
      if (this.searchValue.appSystemId) {
        this.$set(params.query, 'appSystemId', this.searchValue.appSystemId);
      }
      if (this.searchValue.appModuleId) {
        this.$set(params.query, 'appModuleId', this.searchValue.appModuleId);
      }
      this.$router.push(params);
    },
    updateSchedule(row) {
      this.$api.deploy.schedule.updateSchedule({ id: row.id }).then(res => {
        if (res.Status == 'OK') {
          row.isActive = res.Return.isActive;
          this.$Message.success(this.$t('message.executesuccess'));
        }
      }).catch(error => {
        row.isActive = row.isActive ? 0 : 1;
      });
    },
    deleteSchedule(row) {
      if (!row.deletable) {
        return;
      }
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.$t('page.scheduledtask')}),
        btnType: 'error',
        'on-ok': vnode => {
          let params = {
            id: row.id
          };
          this.$api.deploy.schedule.deleteSchedule(params).then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              this.searchSchedule();
            }
          }).finally(() => {
            vnode.isShow = false;
          });
        }
      });
    },
    gotoPipeline(row) {
      if (row.pipelineType) {
        if (row.pipelineType == 'global') {
          this.$router.push({
            path: '/pipeline-edit',
            query: {
              id: row.pipelineId
            }
          });
        } else if (row.pipelineType == 'appSystem') {
          this.$router.push({
            path: '/application-config-manage',
            query: {
              appSystemId: row.appSystemId
            }
          });
        }
      }
    },
    toJobDetail(row) {
      this.$router.push({
        path: '/schedule-job-edit',
        query: {
          id: row.id
        }
      });
    },
    showJobList(row) {
      this.invokeIdList = [row.id];
      this.isListDeployJobDialogShow = true;
    },
    closeListJob() {
      this.invokeIdList = [];
      this.isListDeployJobDialogShow = false;
    },
    restoreHistory(historyData) {
      this.appModuleData = historyData['appModuleEnvData'] || {};
    },
    testRow: function(row, handler) {
      if (!row.editable || row.isActive == 1) {
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
                this.searchSchedule(1);
              }
            });
        }
      });
    },
    showAudit(row) {
      this.isAuditShow = true;
      this.currentJobUuid = row.uuid;
    },
    closeAuditDialog() {
      this.isAuditShow = false;
      this.currentJobUuid = null;
    }
  },
  filter: {},
  computed: {},
  watch: {
    appModuleData: {
      handler(val) {
        this.searchValue.appSystemId = val ? val.appId : null;
        this.searchValue.appModuleId = val ? val.moduleId : null;
        this.searchSchedule(1);
        if (val) { // immediate: true 先执行，返回后会清空缓存的值
          this.$addHistoryData('appModuleEnvData', val);
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less">
</style>
