<template>
  <div>
    <TsContain border="border">
      <template v-slot:topLeft>
        <div v-if="canAddJob" class="action-group">
          <span class="tsfont-plus icon-right text-action" @click="openPortfolioToolsDialog">{{ $t('term.autoexec.job') }}</span>
          <span v-auth="['AUTOEXEC_MODIFY']" class="action-item">
            <AuditConfig auditName="AUTOEXEC-JOB"></AuditConfig>
          </span>
        </div>
      </template>
      <template v-slot:topRight>
        <div>
          <CombineSearcher v-model="searchValue" v-bind="searchConfig" @change="searchJob(1)"></CombineSearcher>
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
          @changeCurrent="startSearchJob"
          @changePageSize="changePageSize"
          @updateSort="updateSort"
        >
          <template v-slot:showChildren="{ row }">
            <span v-if="row.parentId == -1" class="text-href">
              <span :class="{ 'tsfont-minus-square': row['showChildren'], 'tsfont-plus-square': !row['showChildren'] }" @click="toggleChildJob(row)"></span>
            </span>
            <span v-else>
              <!-- 勿删，仅为占位符，否则表格会默认显示 true -->
            </span>
          </template>
          <template v-slot:name="{ row }">
            <span
              class="text-href"
              :class="{ 'ml-nm': !!row.parentId && row.parentId != -1 }"
              @click="toJobDetail(row)"
            ><span v-html="row.name"></span></span>
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
          <template slot="routeName" slot-scope="{ row }">
            <div v-if="row.source == 'inspect' || row.source == 'inspectapp'" style="max-width:150px;" class="overflow">
              {{ row.route && row.route.name }}
            </div>
            <div
              v-else
              style="max-width:150px;"
              class="text-href overflow"
              @click="toRoute(row)"
            >
              {{ row.route && row.route.name }}
            </div>
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
                <template v-if="row.source != 'batchdeploy' && row.parentId != -1 && canDeleteJob">
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
    CombineSearcher: () => import('@/resources/components/CombineSearcher/CombineSearcher.vue'),
    PortfolioToolsDialog: () => import('./tool/portfolio-tools-dialog'), // 创建作业-弹窗
    Liquid: () => import('@/resources/components/SimpleGraph/Liquid.vue'),
    Status: () => import('@/resources/components/Status/CommonStatus.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    ActionDialog: () => import('./job/action-dialog.vue'),
    AuditConfig: () => import('@/views/components/auditconfig/auditconfig.vue')
  },
  filters: {},
  props: {
    // 过滤参数
    filterParams: {
      type: Object,
      default: () => {}
    },
    // 能否添加作业
    canAddJob: {
      type: Boolean,
      default: true
    },
    // 能否删除作业
    canDeleteJob: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isLoading: false,
      isShowPortfolioToolsDialog: false,
      timmer: null,
      searchParam: { sortOrder: { key: 'planStartTime', type: 'DESC' }, currentPage: 1, pageSize: 20 },
      sortOrder: [{ planStartTime: 'DESC' }],
      searchValue: {},
      jobData: {},
      sortList: ['planStartTime', 'startTime'],
      theadList: [
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
            type: 'radio',
            name: 'hasParent',
            label: this.$t('term.autoexec.jobcategory'),
            dataList: [
              {
                text: this.$t('term.autoexec.parentjob'),
                value: 'false'
              },
              {
                text: this.$t('term.autoexec.subjob'),
                value: 'true'
              }
            ],
            transfer: true,
            allowToggle: true
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
      jobConfig: null,
      abortController: null,
      defaultTbodyList: [],
      expandIdList: [] // 展开ID列表
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.startSearchJob();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    this.stopSearchJob();
  },
  destroyed() {},
  methods: {
    toggleChildJob(row) {
      const { keyword = '' } = this.searchValue || {};
      const { id = '' } = row || {};
      if (row['showChildren']) {
        this.$set(row, 'showChildren', false);
        this.expandIdList = this.expandIdList.filter((expandId) => expandId != id);
        for (let i = this.jobData.tbodyList.length - 1; i >= 0; i--) {
          const element = this.jobData.tbodyList[i];
          if (element.parentId === id) {
            this.jobData.tbodyList.splice(i, 1);
          }
        }
      } else {
        if (id) {
          this.expandIdList.push(id);
        }
        const pIndex = this.jobData.tbodyList.findIndex(d => d.id === id);
        const findChildItem = this.defaultTbodyList.find((v) => v.id === id);
        const { children = [] } = findChildItem || {};
        if (pIndex >= 0) {
          this.$set(row, 'showChildren', true);
          children.forEach((item) => {
            if (item.name) {
              item.name = this.$utils.highlightTextByKeywords(item.name, keyword ? [keyword] : []);
            }
          });
          this.jobData.tbodyList.splice(pIndex + 1, 0, ...children);
        }
      }
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
      if (this.filterParams && this.filterParams.scheduleId) {
        window.open(HOME + `/autoexec.html#/job-detail?id=` + row.id, '_blank');
      } else if (row.source === 'batchdeploy' || row.source === 'deployschedulepipeline') {
        const {parentId = '', id = ''} = row || {};
        if (parentId != -1) {
          this.$router.push({
            path: '/job-detail',
            query: { id: row.id }
          });
        } else {
          window.open(HOME + '/deploy.html#/batch-job-detail?id=' + id, '_blank');
        }
      } else {
        this.$router.push({
          path: '/job-detail',
          query: { id: row.id }
        });
      }
    },
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
        window.open(HOME + '/deploy.html#/job-manage', '_blank');
      } else if (row.source == 'deployschedulegeneral' || row.source == 'deployschedulepipeline') {
        window.open(HOME + '/deploy.html#/schedule-job-edit?id=' + routeConfig.id, '_blank');
      } else if (row.source == 'deployci' || row.source == 'deploycipipeline') {
        window.open(HOME + '/deploy.html#/config-add?appSystemId=' + routeConfig.appSystemId + '&id=' + routeConfig.id, '_blank');
      } else if (row.source === 'dr') {
        window.open(HOME + '/dr.html#/preparation-job-detail?id=' + routeConfig.id, '_blank');
      }
    },
    async searchJob(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      // 创建新的 controller
      const abortController = new AbortController();
      this.abortController = abortController;

      this.jobData = {};
      const param = { ...this.searchParam, ...this.searchValue, ...this.filterParams || {} };
      this.$addHistoryData('searchValue', this.searchValue);
      this.$addHistoryData('searchParam', this.searchParam);
      this.isLoading = true;

      try {
        const res = await this.$api.autoexec.job.searchJobList(param, {
          signal: abortController.signal
        });
        const { tbodyList = [], ...restParams } = res.Return || {};

        this.defaultTbodyList = [...tbodyList]; // 子作业数据源

        // 刷新列表的时候，展开的数据默认保持不变
        const { keyword = '', hasParent = '' } = this.searchValue || {};
        const keywordLower = (keyword || '').toLowerCase();
        const keywordList = keyword ? [keyword] : [];
        const isParentMode = hasParent === 'false';
        const isSubMode = hasParent === 'true';
        let resultList = [];
        if (tbodyList.length == 0) {
          return false;
        }
        tbodyList.forEach((tbodyItem) => {
          const children = tbodyItem.children || [];
          const id = tbodyItem.id || '';
          const parentItem = {
            ...tbodyItem,
            showChildren: false
          };

          resultList.push(parentItem);
          
          // 是否有子作业命中关键字
          const hasMatchChild = keywordLower && children.some(child => (child.name || '').toLowerCase().includes(keywordLower));

          // 是否需要展开子作业
          const shouldExpand = isSubMode || (hasMatchChild && this.$utils.isEmpty(hasParent)) || (id && this.expandIdList.includes(id));
          
          if (shouldExpand && children.length) {
            parentItem.showChildren = true;
            resultList.push(...children);
          }
        });

        let targetList = resultList.filter(item => item.name);

        if (isParentMode) {
          const parents = targetList.filter(item => item.parentId == -1);
          if (parents.length > 0) {
            targetList = parents;
          } 
        } else if (isSubMode) {
          const subs = targetList.filter(item => item.parentId != -1);
          if (subs.length > 0) {
            targetList = subs;
          }
        }
        targetList.forEach(item => {
          item.name = this.$utils.highlightTextByKeywords(item.name, keywordList);
        });
        this.jobData = {
          ...restParams,
          tbodyList: resultList
        };

        // 返回是否需要继续轮询（关键）
        return resultList.length > 0;
      } finally {
        this.isLoading = false;
      }
    },
    startSearchJob(currentPage) {
      // 防止重复启动
      this.stopSearchJob();

      this.timmer = this.$utils.setInterval(async() => {
        const needContinue = await this.searchJob(currentPage);

        // 没有数据了，自动停
        if (!needContinue) {
          this.stopSearchJob();
        }
      }, 30 * 1000);
    },
    stopSearchJob() {
      if (this.abortController) {
        this.abortController.abort();
      }
      if (this.timmer) {
        this.timmer.clear();
        this.timmer = null;
      }
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.startSearchJob(1);
    },
    executeRow(row) {
      //执行作业
      this.$api.autoexec.job.executeJob({ jobId: row.id }).then(res => {
        if (res.Status == 'OK') {
          this.$router.push({
            path: '/job-detail',
            query: { id: row.id }
          });
        }
      });
    },
    revokedRow(row) {
      this.$createDialog({
        title: this.$t('dialog.title.revocationconfirm'),
        content: this.$t('dialog.content.revocationconfirm', { target: this.$t('term.autoexec.job') }),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.autoexec.job
            .revokeJob({ jobId: row.id })
            .then(res => {
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.executesuccess'));
                this.startSearchJob();
              }
            })
            .finally(() => {
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
        this.startSearchJob();
      }
    },
    deleteRow(row) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deletetargetconfirm', { target: row.name + '(' + row.id + ')' }),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.autoexec.job
            .deleteJob({ jobId: row.id })
            .then(res => {
              if (res.Status == 'OK') {
                this.startSearchJob();
                this.$Message.success(this.$t('message.deletesuccess'));
              }
            })
            .finally(() => {
              vnode.isShow = false;
            });
        }
      });
    },
    updateSort(sort) {
      this.sortOrder = [];
      this.sortOrder.push(sort);
      this.$addHistoryData('sortOrder', this.sortOrder);
      for (let key in sort) {
        this.$set(this.searchParam, 'sortOrder', { key: key, type: sort[key] });
      }
      this.startSearchJob();
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
<style lang="less" scoped>
</style>
