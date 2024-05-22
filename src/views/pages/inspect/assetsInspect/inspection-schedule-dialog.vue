<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <div class="editForm input-border">
          <div>
            <Row class="mb-md">
              <Col span="12"></Col>
              <Col span="12">
                <InputSearcher
                  v-model="searchParam.keyword"
                  @change="getScheduleList"
                ></InputSearcher>
              </Col>
            </Row>
          </div>
          <TsTable
            :tbodyList="tbodyList"
            :showSizer="false"
            :showPager="false"
            :theadList="theadList"
          >
            <template v-slot:isActive="{ row }">
              <span v-if="row.isActive == 1" class="text-success">{{ $t('page.isactived') }}</span>
              <span v-if="row.isActive == 0" class="text-grey">{{ $t('page.ban') }}</span>
            </template>
            <template v-slot:ciLabel="{ row }">
              <span class="text-href" @click="openCronDialog(row)">{{ row.ciLabel }} ({{ row.ciName }})</span>
            </template>
            <template v-slot:execCount="{ row }">
              <span v-if="row.execCount > 0" class="text-href" @click="openJobListDialog(row)">
                {{ row.execCount }}
              </span>
              <span v-else>-</span>
            </template>
            <template v-slot:cron="{ row }">
              <div>
                <TsQuartz v-if="row.cron" :value="row.cron" showType="read"></TsQuartz>
              </div>
            </template>
            <template v-slot:lcuVo="{ row }">
              <span v-if="row.id">
                <UserCard :initType="row.lcuVo.initType" :uuid="row.lcuVo.uuid" hideAvatar></UserCard>
              </span>
              <span v-else></span>
            </template>
            <template slot="jobStatus" slot-scope="{ row }">
              <div v-if="!$utils.isEmpty(row.jobStatus)">
                <div>
                  <span class="text-grey">{{ $t('term.inspect.exeount') }}：</span>
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
              <div v-if="row.id" class="tstable-action">
                <ul class="tstable-action-ul">
                  <li>
                    <TsFormSwitch
                      v-model="row.isActive"
                      :true-value="1"
                      :false-value="0"
                      showStatus
                      :trueText="$t('page.disable')"
                      :falseText="$t('page.enable')"
                      @on-change="toggleActive(row)"
                    ></TsFormSwitch>
                  </li>
                  <li
                    v-if="row.execCount > 0"
                    class="tsfont-putongjigui"
                    @click="showAudit(row.uuid)"
                  >
                    <!-- 执行记录 -->
                    {{ $t('term.autoexec.executionrecord') }}
                  </li>
                </ul>
              </div>
            </template>
          </TsTable>
        </div>
      </template>
    </TsDialog>
    <EditCronDialog
      v-if="isCronDialogShow"
      :ciData="currentCiData"
      @close="closeCronDialog"
    ></EditCronDialog>
    <JobListDialog v-if="isJobListDialogShow" :id="currentId" @close="closeJobListDialog"></JobListDialog>
    <JobAudit v-if="isAuditShow" :jobUuid="currentJobUuid" @close="closeAuditDialog"></JobAudit>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue'),
    TsQuartz: () => import('@/resources/plugins/TsQuartz/TsQuartz.vue'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    EditCronDialog: () => import('./edit-cron-dialog.vue'),
    JobListDialog: () => import('./job-list-dialog.vue'),
    JobAudit: () => import('../../framework/schedule/job-audit-dialog.vue')
  },
  filters: {},
  props: {
    id: Number
  },
  data() {
    return {
      dialogConfig: {
        type: 'slider',
        hasFooter: false,
        title: this.$t('term.inspect.scheduleinspect'),
        maskClose: true,
        isShow: true,
        width: '80%'
      },
      currentId: null, //当前选中id
      currentJobUuid: null,
      isAuditShow: false, // 定时任务记录
      searchParam: {},
      tbodyList: [],
      theadList: [
        {
          title: this.$t('term.cmdb.citype'),
          key: 'ciLabel'
        },
        {
          title: this.$t('page.status'),
          key: 'isActive'
        },
        {
          title: this.$t('term.pbc.timeplan'),
          key: 'cron',
          width: 200
        },
        {
          title: this.$t('term.autoexec.executionrecord'),
          key: 'execCount'
        },
        {
          title: this.$t('page.fcu'),
          key: 'lcuVo'
        },
        {
          title: this.$t('page.fcd'),
          key: 'lcd',
          type: 'time'
        },
        { key: 'jobStatus', title: this.$t('term.autoexec.executionsituation') },
        { key: 'action', title: '', type: 'action' }
      ],
      isCronDialogShow: false,
      isJobListDialogShow: false,
      currentCiData: null
    };
  },
  beforeCreate() {},
  async created() {
    await this.getScheduleList();
    if (this.id) {
      if (this.tbodyList && this.tbodyList.length > 0) {
        let row = null;
        this.tbodyList.forEach(tbody => {
          if (tbody.id == this.id) {
            row = tbody;
          }
        });
        this.openCronDialog(row);
      }
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
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    openCronDialog(row) {
      this.isCronDialogShow = true;
      this.currentCiData = row;
    },
    closeCronDialog(needRefresh) {
      this.isCronDialogShow = false;
      this.currentCiData = null;
      if (needRefresh) {
        this.getScheduleList();
      }
    },
    async getScheduleList() {
      await this.$api.inspect.assetsInspect.searchSchedule(this.searchParam).then(res => {
        this.tbodyList = res.Return;
      });
    },
    toggleActive(row) {
      const param = {
        id: row.id,
        isActive: row.isActive
      };
      this.$api.inspect.assetsInspect.updateStatus(param).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
          this.getScheduleList();
        }
      });
    },
    openJobListDialog(row) {
      this.currentId = row.id;
      this.isJobListDialogShow = true;
    },
    closeJobListDialog() {
      this.currentId = null;
      this.isJobListDialogShow = false;
    }, showAudit(jobUuid) {
      this.isAuditShow = true;
      this.currentJobUuid = jobUuid;
    },
    closeAuditDialog() {
      this.isAuditShow = false;
      this.currentJobUuid = null;
    }
  },
  computed: {},
  watch: {
  }
};
</script>
<style scoped lang="less"></style>
