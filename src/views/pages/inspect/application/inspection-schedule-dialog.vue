<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <div class="editForm input-border">
          <div>
            <Row class="mb-md">
              <Col span="12"></Col>
              <Col span="12">
                <InputSearcher v-model="searchParam.keyword" @change="changeKeyword"></InputSearcher>
              </Col>
            </Row>
          </div>
          <TsTable 
            v-bind="tableData"
            :theadList="theadList"
            @changeCurrent="getScheduleList"
            @changePageSize="changePageSize"
          >
            <template v-slot:isActive="{ row }">
              <span v-if="row.isActive == 1" class="text-success">已激活</span>
              <span v-if="row.isActive == 0" class="text-grey">已禁用</span>
            </template>
            <template v-slot:appSystem="{ row }">
              <span class="text-href" @click="openCronDialog(row)">{{ row.appSystemAbbrName }} ({{ row.appSystemName }})</span>
            </template>
            <template v-slot:execCount="{ row }">
              <span v-if="row.execCount > 0" class="text-href" @click="openJobListDialog(row)">{{ row.execCount }}</span>
              <span v-else></span>
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
                  <span class="text-grey">启动后已执行：</span>
                  <span>{{ row.jobStatus.execCount || '0' }}次</span>
                </div>
                <div v-if="row.jobStatus.beginTime != null">
                  <span class="text-grey">计划开始时间：</span>
                  <span>{{ row.jobStatus.beginTime | formatDate }}</span>
                </div>
                <div v-if="row.jobStatus.endTime != null">
                  <span class="text-grey">计划结束时间：</span>
                  <span>{{ row.jobStatus.endTime | formatDate }}</span>
                </div>
                <div v-if="row.jobStatus.lastFireTime != null">
                  <span class="text-grey">最近激活时间：</span>
                  <span>{{ row.jobStatus.lastFireTime | formatDate }}</span>
                </div>
                <div v-if="row.jobStatus.lastFinishTime != null">
                  <span class="text-grey">最近完成时间：</span>
                  <span>{{ row.jobStatus.lastFinishTime | formatDate }}</span>
                </div>
                <div v-if="row.jobStatus.nextFireTime != null">
                  <span class="text-grey">下次激活时间：</span>
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
                      trueText="禁用"
                      falseText="激活"
                      @on-change="toggleActive(row)"
                    ></TsFormSwitch>
                  </li>
                  <li
                    v-if="row.execCount > 0"
                    class="ts-page"
                    :title="$t('autoexec.execRecord.letter')"
                    @click="showAudit(row.id)"
                  >
                    <!-- 执行记录 -->
                    {{ $t('autoexec.execRecord') }}
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
      :scheduleData="currentRowData"
      @close="closeCronDialog"
    ></EditCronDialog>
    <JobListDialog
      v-if="isJobListDialogShow"
      :id="currentId"
      @close="closeJobListDialog"
    ></JobListDialog>
    <JobAudit v-if="isAuditShow" :jobUuid="currentJobUuid" @close="closeAuditDialog"></JobAudit>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve),
    TsQuartz: resolve => require(['@/resources/plugins/TsQuartz/TsQuartz.vue'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    EditCronDialog: resolve => require(['./edit-cron-dialog.vue'], resolve),
    JobListDialog: resolve => require(['./job-list-dialog.vue'], resolve),
    JobAudit: resolve => require(['../../framework/schedule/job-audit-dialog.vue'], resolve)
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
        title: '定时巡检',
        maskClose: true,
        isShow: true,
        width: '80%'
      },
      currentId: null,
      currentJobUuid: null,
      isAuditShow: false, // 定时任务记录
      searchParam: {
        keyword: '',
        currentPage: 1,
        pageSize: 20
      },
      tableData: {},
      tbodyList: [],
      theadList: [
        {
          title: this.$t('page.application'),
          key: 'appSystem'
        },
        {
          title: '状态',
          key: 'isActive'
        },
        {
          title: '时间计划',
          key: 'cron',
          width: 200
        },
        {
          title: '执行记录',
          key: 'execCount'
        },
        {
          title: '修改人',
          key: 'lcuVo'
        },
        {
          title: '修改时间',
          key: 'lcd',
          type: 'time'
        },
        { key: 'jobStatus', title: '执行情况' }, 
        {
          key: 'action',
          title: '',
          type: 'action'
        }
      ],
      isCronDialogShow: false,
      isJobListDialogShow: false,
      currentRowData: null
    };
  },
  beforeCreate() {},
  created() {
    this.getScheduleList(1);
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
      this.currentRowData = row;
    },
    closeCronDialog(needRefresh) {
      this.isCronDialogShow = false;
      this.currentRowData = null;
      if (needRefresh) {
        this.getScheduleList();
      }
    },
    getScheduleList(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      this.$api.inspect.applicationInspect.searchSchedule(this.searchParam).then(res => {
        this.tableData = res.Return;
      });
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.getScheduleList(1);
    },
    changeKeyword(keyword) {
      this.searchParam.keyword = keyword;
      this.getScheduleList(1);
    },
    toggleActive(row) {
      const param = {
        id: row.id,
        isActive: row.isActive
      };
      this.$api.inspect.applicationInspect.updateStatus(param).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.content.executesuccess'));
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
      this.currentJobUuid = '' + jobUuid;
    },
    closeAuditDialog() {
      this.isAuditShow = false;
      this.currentJobUuid = null;
    }
  },
  computed: {},
  watch: {}
};
</script>
<style scoped lang="less"></style>
