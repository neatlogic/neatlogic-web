<template>
  <div>
    <TsTable
      v-if="!showLoading"
      v-bind="tableConfig"
      class="job-table"
      @operation="operation"
      @changeCurrent="getData"
      @changePageSize="getData(1, ...arguments)"
    >
      <template slot="completionRate" slot-scope="{row}">
        <Liquid
          :percent="row.completionRate"
          :size="7"
          :config="getconfig(row)"
        />
      </template>
      <!-- <template slot="operationType" slot-scope="{row}">
        <span class="text-href" @click="typeDetailed(row)">
          <span>{{ row.operationTypeName }}</span>
          <span v-if="row.operationName">({{ row.operationName }})</span>
        </span>
      </template> -->
      <template slot="routeName" slot-scope="{ row }">
        <span v-if="row.source == 'inspect' || row.source == 'inspectapp'">
          <span>{{ row.route && row.route.name }}</span>
        </span>
        <span v-else class="text-href" @click="toRoute(row)">
          <span>{{ row.route && row.route.name }}</span>
        </span>
      </template>
      <template slot="status" slot-scope="{row}">
        <Status
          :statusValue="row.status"
          :statusName="row.statusName"
          :type="'text'"
          class="job-status"
        ></Status>
      </template>
      <template slot="action" slot-scope="{ row }">
        <div class="tstable-action">
          <ul class="tstable-action-ul">
            <!-- <li class="icon tsfont-trash-o" @click.stop="deleteRow(row)">{{ $t('page.delete') }}</li> -->
            <template v-if="row.isCanExecute && row.status == 'ready'">
              <li class="icon tsfont-edit" @click.stop="editRow(row,'planStartTime')">{{ $t('page.plantime') }}</li>
              <li class="icon tsfont-edit" @click.stop="editRow(row,'triggerType')">{{ $t('term.autoexec.triggertype') }}</li>
              <li v-if="row.triggerType == 'manual'" class="icon tsfont-run" @click.stop="executeRow(row)">{{ $t('page.execute') }}</li>
              <li class="icon tsfont-undo" @click.stop="revokedRow(row)">{{ $t('page.revocation') }}</li>
            </template>
            <template v-if="row.isCanTakeOver">
              <li class="icon tsfont-takeover" @click.stop="editRow(row,'takeover')">{{ $t('page.takeover') }}</li>
            </template>
          </ul>
        </div>
      </template>
    </TsTable>
    <Loading :loadingShow="showLoading" style="padding-top:50px;"></Loading>
    <TsDialog
      v-if="editDialog"
      type="modal"
      :isShow.sync="editDialog"
      :title="editTitle"
      @on-ok="okUpdate"
    >
      <template v-if="editType=='planStartTime'">
        <TsFormItem :label="$t('page.plantime')" :required="true" labelWidth="80">
          <TsFormDatePicker
            ref="formValid"
            v-model="planStartTime"
            v-bind="itemList.planStartTime"
          ></TsFormDatePicker>
        </TsFormItem>
      </template>
      <template v-else-if="editType=='triggerType'">
        <TsFormItem :label="$t('term.autoexec.triggertype')" :required="true" labelWidth="80">
          <TsFormSelect
            ref="formValid"
            v-model="triggerType" 
            v-bind="itemList.triggerType"
          ></TsFormSelect>
        </TsFormItem>
      </template>
      <template v-else-if="editType=='takeover'">
        {{ $t('dialog.content.takeoverjobconfirm', {target: $t('term.autoexec.job')}) }}
      </template>
    </TsDialog>
  </div>
</template>
<script>
import Liquid from '@/resources/components/SimpleGraph/Liquid.vue';
export default {
  name: '',
  components: {
    Status: resolve => require(['@/resources/components/Status/CommonStatus.vue'], resolve),
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsFormDatePicker: resolve => require(['@/resources/plugins/TsForm/TsFormDatePicker'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    Liquid
  },
  filters: {},
  props: {
    params: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    let _this = this;
    return {
      showLoading: true,
      tableConfig: {
        theadList: [
          {
            title: '#',
            key: 'id'
          },
          {
            title: this.$t('page.name'),
            key: 'name',
            type: 'linktext',
            textValue: 'view'
          },
          // {
          //   title: this.$t('page.sourcecategory'),
          //   key: 'operationType'
          // },
          {
            title: this.$t('page.sourcecategory'),
            key: 'routeName'
          },
          {
            title: this.$t('page.source'),
            key: 'sourceName'
          },
          {
            title: this.$t('page.plantime'),
            key: 'planStartTime',
            type: 'time'
          },
          {
            title: this.$t('page.startstoptime'),
            key: 'startTime',
            keyend: 'endTime',
            type: 'startEndTime'
          },
          {
            title: this.$t('page.status'),
            key: 'status'
          },
          {
            title: this.$t('term.autoexec.triggertype'),
            key: 'triggerTypeName'
          },
          {
            title: this.$t('term.autoexec.executionsituation'),
            key: 'completionRate'
          },
          {
            title: this.$t('page.timecost'),
            key: 'costTime'
          },
          {
            title: this.$t('page.executeuser'),
            key: 'execUserVo',
            type: 'user',
            uuid: 'uuid'
          },
          {
            key: 'action'
          }
        ],
        tbodyList: [],
        pageSize: 20,
        currentPage: 1
      },
      setTimeGetData: null,
      editDialog: false,
      editTitle: this.$t('dialog.title.edittarget', {target: this.$t('term.autoexec.triggertype') }),
      editType: 'planStartTime',
      editConfig: null,
      planStartTime: null,
      triggerType: null,
      itemList: {
        planStartTime: {
          type: 'datetime',
          transfer: true,
          label: this.$t('page.plantime'),
          desc: this.$t('term.autoexec.taskexpirationtip'),
          options: {
            disabledDate(date) {
              return date && date.valueOf() < Date.now() - 86400000;
            }
          },
          timePickerOptions: {
            disabledHours: [],
            disabledMinutes: []
          },
          validateList: [
            'required',
            {
              name: 'custom', message: this.$t('term.autoexec.taskexpirationtip'), validator: function(rule, value) { 
                return _this.validDateTime(value);
              }} 
          ],
          onChange: (value) => {
            _this.getTimeDisabledList(value);
          }
        },
        triggerType: {
          type: 'select',
          transfer: true,
          label: this.$t('term.autoexec.triggertype'),
          dataList: [],
          validateList: ['required']
        }
      }

    };
  },
  beforeCreate() {},
  created() {
  },
  beforeMount() {},
  mounted() {
    this.getData(1, null, true);//获取数据 同时启动定时器进行刷新数据
    this.getTriggerTypeLit();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    let _this = this;
    _this.setTimeGetData && clearTimeout(_this.setTimeGetData);
  },
  destroyed() {},
  methods: {
    async getData(currentPage, pageSize, isRefresh) { //获取表格数据
      let params = Object.assign({}, this.params);
      params.currentPage = currentPage || this.tableConfig.currentPage;
      params.pageSize = pageSize || this.tableConfig.pageSize;
      this.tableConfig.pageSize = pageSize || this.tableConfig.pageSize;
      !isRefresh && (this.showLoading = true);
      await this.$api.autoexec.job.searchJobList(params).then(res => {
        if (res.Status == 'OK') {
          this.tableConfig = Object.assign(this.tableConfig, res.Return);
        }
      }).finally(() => {
        this.showLoading = false;
        if (isRefresh) {
          let _this = this;
          _this.setTimeGetData && clearTimeout(_this.setTimeGetData);
          _this.setTimeGetData = setTimeout(() => {
            _this.getData(null, null, true);
          }, 60 * 1000);
        }
      });
    },
    operation(row, view) {
      if (view == 'view') {
        this.toEdit(row);
      }
    },
    // typeDetailed(row) {
    //   let url = '';
    //   if (row.operationType == 'combop') {
    //     url = 'action-detail?id=' + row.operationId;
    //   } else if (row.operationType == 'script') {
    //     url = 'script-detail?versionId=' + row.operationId + '&status=' + row.status;
    //   }
    //   this.$router.push({
    //     path: url
    //   });
    // },
    toRoute(row) {
      let routeConfig = row.route?.config;
      if (routeConfig == null) {
        return;
      }
      if (row.source == 'combop' || row.source == 'comboptest') {
        window.open(HOME + '/autoexec.html#/action-detail?id=' + routeConfig.id + '&versionId=' + routeConfig.versionId, '_blank');
      } else if (row.source == 'scripttest') {
        window.open(HOME + '/autoexec.html#/script-detail?versionId=' + routeConfig.versionId, '_blank');
      } else if (row.source == 'tooltest') {
        window.open(HOME + '/autoexec.html#/tool-detail?id=' + routeConfig.id, '_blank');
      } else if (row.source == 'autoexecschedule') {
        window.open(HOME + '/autoexec.html#/time-job-detail?id=' + routeConfig.id, '_blank');
      } else if (row.source == 'service') {
        window.open(HOME + '/autoexec.html#/catalog-manage?id=' + routeConfig.id, '_blank');
      } else if (row.source == 'itsm') {
        window.open(HOME + '/process.html#/flow-edit?uuid=' + routeConfig.uuid + '&stepUuid=' + routeConfig.stepUuid, '_blank');
      } else if (row.source == 'discovery') {
        window.open(HOME + '/cmdb.html#/discovery-conf-manage?id=' + routeConfig.id, '_blank');
      } else if (row.source == 'inspect') {
        return;
      } else if (row.source == 'inspectapp') {
        return;
      } else if (row.source == 'scheduleinspect') {
        window.open(HOME + '/inspect.html#/assets-inspection-manage?scheduleId=' + routeConfig.scheduleId + '&isShowInspectionScheduleDialog=true', '_blank');
      } else if (row.source == 'scheduleinspectapp') {
        window.open(HOME + '/inspect.html#/application-manage?scheduleId=' + routeConfig.scheduleId + '&isShowInspectionScheduleDialog=true', '_blank');
      } else if (row.source == 'deploy') {
        window.open(HOME + '/deploy.html#/application-config-pipeline-detail?appSystemId=' + routeConfig.appSystemId, '_blank');
      } else if (row.source == 'batchdeploy') {
        return;
      } else if (row.source == 'deployschedulegeneral' || row.source == 'deployschedulepipeline') {
        window.open(HOME + '/deploy.html#/schedule-job-edit?id=' + routeConfig.id, '_blank');
      } else if (row.source == 'deployci') {
        window.open(HOME + '/deploy.html#/config-add?appSystemId=' + routeConfig.appSystemId + '&id=' + routeConfig.id, '_blank');
      }
      console.log('row.source', row.source);
    },
    deleteRow(row) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: row.id}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.autoexec.job.deleteJob({jobId: row.id}).then(res => {
            if (res.Status == 'OK') {
              this.getData();
              this.$Message.success(this.$t('message.deletesuccess'));
            }
          }).finally(() => {
            vnode.isShow = false;
          });
        }
      });
    },
    toEdit(row) {
      if (this.params && this.params.scheduleId) {
        window.open(HOME + `/autoexec.html#/job-detail?id=` + row.id + '?status=' + row.status, '_blank');
      } else {
        this.$router.push({
          path: '/job-detail',
          query: {id: row.id, status: row.status}
        });
      }
    },
    executeRow(row) { //执行作业
      this.$api.autoexec.job.executeJob({jobId: row.id}).then(res => {
        if (res.Status == 'OK') {
          this.$router.push({
            path: '/job-detail',
            query: {id: row.id}
          });
        }
      });
    },
    revokedRow(row) {
      this.$createDialog({
        title: this.$t('dialog.title.revocationconfirm'),
        content: this.$t('dialog.content.revocationconfirm', {target: this.$t('term.autoexec.job')}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.autoexec.job.revokeJob({jobId: row.id}).then(res => {
            if (res.Status == 'OK') {
              this.getData();
              this.$Message.success(this.$t('message.executesuccess'));
            }
          }).finally(() => {
            vnode.isShow = false;
          });
        }
      });
    },
    editRow(row, type) {
      this.editConfig = row;
      this.editType = type;
      if (type == 'planStartTime') {
        this.editTitle = this.$t('dialog.title.edittarget', {target: this.$t('term.autoexec.triggertype') });
        this.getTimeDisabledList();
        this.planStartTime = this.editConfig.planStartTime;
      } else if (type == 'triggerType') {
        this.editTitle = this.$t('dialog.title.edittarget', {target: this.$t('term.autoexec.triggertype') });
        this.triggerType = this.editConfig.triggerType;
      } else if (type == 'takeover') {
        this.editTitle = this.$t('term.autoexec.takeoverjob');
      }
      this.editDialog = true;
    },
    okUpdate() {
      if (this.$refs.formValid && !this.$refs.formValid.valid()) {
        return;
      }
      let data = {
        jobId: this.editConfig.id
      };
      if (this.editType == 'takeover') { //接管
        this.$api.autoexec.job.takeoverJob(data).then(res => {
          if (res.Status == 'OK') {
            this.getData();
            this.$Message.success(this.$t('message.executesuccess'));
          }
        }).finally(() => {
          this.editDialog = false;
        });
      } else { //修改计划时间、触发方式
        if (this.editType == 'planStartTime') {
          this.$set(data, 'planStartTime', this.planStartTime);
        } else if (this.editType == 'triggerType') {
          this.$set(data, 'triggerType', this.triggerType);
        }
        this.$api.autoexec.job.updatePlanJob(data).then(res => {
          if (res.Status == 'OK') {
            this.getData();
            this.$Message.success(this.$t('message.executesuccess'));
          }
        }).finally(() => {
          this.editDialog = false;
        });
      }
    },
    getTriggerTypeLit() { //触发方式
      let data = {enumClass: 'neatlogic.framework.autoexec.constvalue.JobTriggerType'};
      this.$api.common.getSelectList(data).then(res => {
        if (res.Status == 'OK') {
          this.itemList.triggerType.dataList = res.Return || [];
        }
      });
    },
    getTimeDisabledList(value) { //时间限制
      let curData = new Date();
      let min = curData.getMinutes();
      let newData = new Date(curData.setMinutes(min + 5));
      let Hours = newData.getHours();
      let Minutes = newData.getMinutes();
      let disabledHoursList = [];
      let disabledMinutesList = [];
      if (!value || (value && this.$utils.getDateByFormat(value, 'yyyy-MM-dd') == this.$utils.getCurrenttime('yyyy-MM-dd'))) {
        let selectTime = -1;
        if (this.planStartTime) {
          selectTime = new Date(this.planStartTime).getHours();
        }
        for (let i = 0; i <= Hours; i++) {
          if (i < Hours) {
            disabledHoursList.push(i);
          } else if (Minutes > 54) {
            disabledHoursList.push(i);
          }
        }
        if (selectTime <= Hours) {
          for (let i = 0; i <= Minutes; i++) {
            disabledMinutesList.push(i);
          }
        }
      }
      this.itemList.planStartTime.timePickerOptions.disabledHours = disabledHoursList;
      this.itemList.planStartTime.timePickerOptions.disabledMinutes = disabledMinutesList;
    },
    validDateTime(value) {
      let dateTime = this.planStartTime || value;
      let isValid = true;
      let curData = new Date();
      let min = curData.getMinutes();
      curData.setMinutes(min + 5);
      if (!dateTime || (dateTime && dateTime < curData.getTime())) {
        isValid = false;
      }
      return isValid;
    }
  },
  computed: {
    getconfig() {
      return row => {
        let config = {};
        config.status = row.status;
        row.status == 'running' ? config.status = 'active'
          : row.status == 'error' ? config.status = 'wrong' : '';
        // config['stroke-color'] = row.statusVo.color;
        return config;
      };
    }
  },
  watch: {
    params: {
      handler(newValue, oldValue) {
        this.getData(1);
      },
      deep: true
    }
  }
};
</script>
<style lang='less' scoped>

</style>
