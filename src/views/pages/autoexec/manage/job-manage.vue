/*
 * Copyright(c) 2023 NeatLogic Co., Ltd. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
<template>
  <div>
    <TsContain border="border">
      <template v-slot:topLeft>
        <div class="action-group">
          <span class="tsfont-plus icon-right text-action" @click="openPortfolioToolsDialog">{{ $t('term.autoexec.job') }}</span>
          <span v-auth="['AUTOEXEC_MODIFY']" class="action-item"> 
            <AuditConfig auditName="AUTOEXEC-JOB"></AuditConfig>
          </span>
        </div>
      </template>
      <template v-slot:topRight>
        <div>
          <CombineSearcher
            v-model="searchValue"
            v-bind="searchConfig"
            @change="searchJob(1)"
          ></CombineSearcher>
        </div>
      </template>
      <template v-slot:content>
        <TsTable
          v-bind="jobData"
          :sortList="sortList"
          :sortOrder="sortOrder"
          :loading="isLoading"
          :theadList="theadList"
          :sortMulti="false"
          @changeCurrent="searchJob"
          @changePageSize="changePageSize"
          @updateSort="updateSort"
        >
          <template v-slot:showChildren="{ row }">
            <span v-if="row.parentId == -1" class="text-href">
              <span v-if="!row.loading" :class="{ 'tsfont-minus-square': row['showChildren'], 'tsfont-plus-square': !row['showChildren'] }" @click="toggleChildJob(row)"></span>
              <Icon
                v-else
                type="ios-loading"
                size="16"
                class="loading"
              ></Icon>
            </span>
          </template>
          <template v-slot:name="{ row }">
            <span
              v-if="row.parentId != -1"
              class="text-href"
              :class="{ 'ml-nm': !!row.parentId }"
              @click="toJobDetail(row)"
            >{{ row.name }}</span>
            <span v-else-if="row.parentId == -1" class="text-href" @click="toBatchJobDetail(row)">
              {{ row.name }}
            </span>
            <Tooltip
              v-if="row.warnCount > 0 || row.isHasIgnored > 0"
              transfer
              class="stepStatues com-status"
              placement="bottom"
              theme="light"
            >
              <span class="tsfont-warning-o text-warn"></span>
              <template v-slot:content>
                <div>
                  <div v-if="row.warnCount > 0">{{ $t('term.autoexec.jobwarninginfo') }}</div>
                  <div v-if="row.isHasIgnored > 0">{{ $t('term.autoexec.jobignoreinfo') }}</div>
                </div>
              </template>
            </Tooltip>
          </template>
          <template slot="completionRate" slot-scope="{ row }">
            <Liquid :percent="row.completionRate" :size="7" :config="getconfig(row)" />
          </template>
          <!-- <template slot="operationType" slot-scope="{ row }">
            <span class="text-href" @click="toOperationDetail(row)">
              <span>{{ row.operationTypeName }}</span>
              <span v-if="row.operationName">({{ row.operationName }})</span>
            </span>
          </template> -->
          <template slot="routeName" slot-scope="{ row }">
            <span v-if="row.source == 'inspect' || row.source == 'inspectapp' || row.source == 'batchdeploy'">
              <span>{{ row.route && row.route.name }}</span>
            </span>
            <span v-else class="text-href" @click="toRoute(row)">
              <span>{{ row.route && row.route.name }}</span>
            </span>
          </template>
          <template slot="status" slot-scope="{ row }">
            <Status
              :statusValue="row.status"
              :statusName="row.statusName"
              :type="'text'"
              class="job-status"
            ></Status>
          </template>
          <template v-slot:startTime="{ row }">
            <div v-if="row.startTime" class="fz10">
              <span>{{ row.startTime | formatDate }}</span>
              <span class="text-grey ml-xs">{{ $t('page.begin') }}</span>
            </div>
            <div v-if="row.endTime" class="fz10">
              <span>{{ row.endTime | formatDate }}</span>
              <span class="text-grey ml-xs">{{ $t('page.finish') }}</span>
            </div>
          </template>
          <template slot="action" slot-scope="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <template v-if="row.isCanExecute && row.status == 'ready'">
                  <li class="icon tsfont-edit" @click.stop="editRow(row, 'planStartTime')">{{ $t('page.plantime') }}</li>
                  <li class="icon tsfont-edit" @click.stop="editRow(row, 'triggerType')">{{ $t('term.autoexec.triggertype') }}</li>
                  <li v-if="row.triggerType == 'manual'" class="icon tsfont-run" @click.stop="executeRow(row)">{{ $t('page.execute') }}</li>
                  <li class="icon tsfont-undo" @click.stop="revokedRow(row)">{{ $t('page.revocation') }}</li>
                </template>
                <template v-if="row.isCanTakeOver">
                  <li class="icon tsfont-takeover" @click.stop="editRow(row, 'takeover')">{{ $t('page.takeover') }}</li>
                </template>
                <template v-if="row.source != 'batchdeploy'">
                  <li v-auth="'AUTOEXEC_JOB_MODIFY'" class="icon tsfont-trash-o" @click.stop="deleteRow(row)">{{ $t('page.delete') }}</li>
                </template>
              </ul>
            </div>
          </template>
        </TsTable>
      </template>
    </TsContain>
    <PortfolioToolsDialog v-if="isShowPortfolioToolsDialog" @close="closePortfolioToolsDialog"></PortfolioToolsDialog>
    <ActionDialog
      v-if="editDialog"
      :jobConfig="jobConfig"
      :editType="editType"
      @updateData="updateJobData"
    ></ActionDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    CombineSearcher: resolve => require(['@/resources/components/CombineSearcher/CombineSearcher.vue'], resolve),
    PortfolioToolsDialog: resolve => require(['./tool/portfolio-tools-dialog'], resolve), // 创建作业-弹窗
    Liquid: resolve => require(['@/resources/components/SimpleGraph/Liquid.vue'], resolve),
    Status: resolve => require(['@/resources/components/Status/CommonStatus.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    ActionDialog: resolve => require(['./job/action-dialog.vue'], resolve),
    AuditConfig: resolve => require(['@/views/components/auditconfig/auditconfig.vue'], resolve)
  },
  filters: {},
  props: {},
  data() {
    return {
      isLoading: false,
      isShowPortfolioToolsDialog: false,
      timmer: null,
      searchParam: {hasParent: false, sortOrder: {key: 'planStartTime', type: 'DESC'}},
      sortOrder: [{planStartTime: 'DESC'}],
      searchValue: {},
      jobData: {},
      jobEndStatusList: ['completed', 'aborted', 'ignored', 'failed'], //终点状态节点列表，非终点状态列表的需要定时刷新。
      sortList: ['planStartTime', 'startTime'],
      theadList: [
        /*{
          title: '#',
          key: 'id'
        },*/
        { key: 'showChildren' },
        {
          title: this.$t('page.name'),
          key: 'name'
        },
        {
          title: this.$t('page.status'),
          key: 'status'
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
          keyend: 'endTime'
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
          key: 'action'
        }
      ],
      searchConfig: {
        search: true,
        placeholder: this.$t('term.autoexec.job'),
        searchList: [
          {
            type: 'text',
            name: 'combopName',
            label: this.$t('term.autoexec.combinationtool')
          },
          {
            type: 'select',
            name: 'typeIdList',
            label: this.$t('term.autoexec.toolclassification'),
            multiple: true,
            dynamicUrl: '/api/rest/autoexec/type/search',
            rootName: 'tbodyList',
            dealDataByUrl: this.$utils.getToolClassificationList,
            transfer: true
          },
          {
            type: 'select',
            name: 'statusList',
            label: this.$t('page.jobstatus'),
            multiple: true,
            url: '/api/rest/universal/enum/get',
            params: { enumClass: 'neatlogic.framework.autoexec.constvalue.JobStatus' },
            transfer: true
          },
          {
            type: 'select',
            name: 'sourceList',
            label: this.$t('term.autoexec.jobsource'),
            multiple: true,
            url: '/api/rest/autoexec/job/source/list'
          },
          {
            type: 'userselect',
            name: 'execUserList',
            label: this.$t('term.autoexec.operator'),
            groupList: ['user'],
            transfer: true
          },
          {
            type: 'timeselect',
            name: 'startTime',
            label: this.$t('term.autoexec.executiontime'),
            transfer: true
          }
        ]
      },
      editType: 'planStartTime',
      editDialog: false,
      jobConfig: null
    };
  },
  beforeCreate() {},
  created() {
   
  },
  beforeMount() {},
  mounted() { this.searchJob(1); },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    if (this.timmer) {
      clearTimeout(this.timmer);
      this.timmer = null;
    }
  },
  destroyed() {},
  methods: {
    toggleChildJob(row, isShow) {
      if (row['showChildren']) {
        this.$set(row, 'showChildren', false);
        for (let i = this.jobData.tbodyList.length - 1; i >= 0; i--) {
          const element = this.jobData.tbodyList[i];
          if (element.parentId === row.id) {
            this.jobData.tbodyList.splice(i, 1);
          }
        }
      } else {
        this.getChildrenJob(row);
      }
    },
    getChildrenJob(parentRow) {
      this.$set(parentRow, 'loading', true);
      this.$api.autoexec.job.searchJobList({ parentId: parentRow.id }).then(res => {
        const jobList = res.Return.tbodyList;
        if (jobList && jobList.length > 0) {
          const pIndex = this.jobData.tbodyList.findIndex(d => d === parentRow);
          if (pIndex >= 0) {
            this.$set(parentRow, 'showChildren', true);
            this.$set(parentRow, 'loading', false);
            this.jobData.tbodyList.splice(pIndex + 1, 0, ...jobList);
          }
        }
      });
    },
    openPortfolioToolsDialog() {
      this.isShowPortfolioToolsDialog = true;
    },
    closePortfolioToolsDialog() {
      this.isShowPortfolioToolsDialog = false;
    },
    restoreHistory(historyData) {
      if (historyData['searchParam']) {
        this.searchParam = historyData['searchParam'];
      }
      if (historyData['searchValue']) {
        this.searchValue = historyData['searchValue'];
      }
      if (historyData['sortOrder']) {
        this.sortOrder = historyData['sortOrder'];
      }
    },
    toJobDetail(row) {
      this.$router.push({
        path: '/job-detail',
        query: { id: row.id }
      });
    },
    toBatchJobDetail(row) {
      this.$router.push({
        path: '/batch-job-detail',
        query: { id: row.id }
      });
    },
    // toOperationDetail(row) {
    //   if (row.operationType == 'combop') {
    //     this.$router.push({
    //       path: 'action-detail?id=' + row.operationId
    //     });
    //   } else if (row.operationType == 'script') {
    //     this.$router.push({
    //       path: 'script-detail?versionId=' + row.operationId + '&status=' + row.status
    //     });
    //   }
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
        window.open(HOME + '/process.html#/task-detail?processTaskId=' + routeConfig.processTaskId + '&processTaskStepId=' + routeConfig.processTaskStepId, '_blank');
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
    },
    searchJob(currentPage) {
      if (this.timmer) {
        clearTimeout(this.timmer);
        this.timmer = null;
      }
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      const param = { ...this.searchParam, ...this.searchValue };
      this.$addHistoryData('searchValue', this.searchValue);
      this.$addHistoryData('searchParam', this.searchParam);
      this.isLoading = true;
      this.$api.autoexec.job.searchJobList(param).then(res => {
        this.jobData = res.Return;
        const idList = [];
        if (this.jobData.tbodyList && this.jobData.tbodyList.length > 0) {
          this.jobData.tbodyList.forEach(element => {
            if (!this.jobEndStatusList.includes(element.status)) {
              idList.push(element.id);
            }
          });
          if (idList.length > 0) {
            this.timmer = setTimeout(() => {
              this.refresh(idList);
            }, 5000);
          }
        }
      }).finally(() => {
        this.isLoading = false;
      });
    },
    refresh(idList) {
      if (this.timmer) {
        clearTimeout(this.timmer);
        this.timmer = null;
      }
      this.$api.autoexec.job.searchJobList({needPage: false, idList: idList}).then(res => {
        const jobList = res.Return.tbodyList;
        const newIdList = [];
        if (jobList && jobList.length > 0) {
          jobList.forEach(job => {
            const element = this.jobData.tbodyList.find(d => d.id === job.id);
            if (element) {
              this.$set(element, 'status', job.status);
              this.$set(element, 'statusName', job.statusName);
              this.$set(element, 'startTime', job.startTime);
              this.$set(element, 'endTime', job.endTime);
            }
          });
          this.jobData.tbodyList.forEach(job => {
            if (!this.jobEndStatusList.includes(job.status)) {
              newIdList.push(job.id);
            }
          });
          if (newIdList.length > 0) {
            this.timmer = setTimeout(() => { this.refresh(newIdList); }, 5000);
          }
        }
      });
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchJob(1);
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
              this.$Message.success(this.$t('message.executesuccess'));
              this.searchJob();
            }
          }).finally(() => {
            vnode.isShow = false;
          });
        }
      });
    },
    editRow(row, type) {
      this.jobConfig = row;
      this.editType = type;
      this.editDialog = true;
    },
    updateJobData(isUpdate) {
      this.editDialog = false;
      if (isUpdate) {
        this.searchJob();
      }
    },
    deleteRow(row) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: row.name + '(' + row.id + ')'}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.autoexec.job.deleteJob({jobId: row.id}).then(res => {
            if (res.Status == 'OK') {
              this.searchJob();
              this.$Message.success(this.$t('message.deletesuccess'));
            }
          }).finally(() => {
            vnode.isShow = false;
          });
        }
      });
    }, updateSort(sort) {
      this.sortOrder = [];
      this.sortOrder.push(sort);
      this.$addHistoryData('sortOrder', this.sortOrder);
      for (let key in sort) {
        this.$set(this.searchParam, 'sortOrder', {'key': key, 'type': sort[key]});
      }
      this.searchJob();
    }
  },
  computed: {
    getconfig() {
      return row => {
        let config = {};
        config.status = row.status;
        row.status == 'running' ? (config.status = 'active') : row.status == 'error' ? (config.status = 'wrong') : '';
        return config;
      };
    }
  },
  watch: {}
};
</script>
