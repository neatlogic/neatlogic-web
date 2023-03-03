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
  <TsContain border="border">
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
        :theadList="theadList"
        @changeCurrent="searchJob"
        @changePageSize="changePageSize"
      >
        <template v-slot:name="{ row }">
          <span class="text-href" @click="toJobDetail(row)">{{ row.name }}</span>
        </template>
        <template slot="completionRate" slot-scope="{row}">
          <Liquid
            :percent="row.completionRate"
            :size="7"
            :config="getconfig(row)"
          />
        </template>
        <template slot="operationType" slot-scope="{row}">
          <span class="text-href" @click="goDetail(row)">
            <span>{{ row.operationTypeName }}</span>
            <span v-if="row.operationName">({{ row.operationName }})</span>
          </span>
        </template>
        <template slot="status" slot-scope="{row}">
          <Status :statusValue="row.status" :statusName="row.statusName" type="text"></Status>
        </template>
        <template v-slot:action="{ row }">
          <div class="tstable-action">
            <ul class="tstable-action-ul">
              <li class="tsfont-ipliebiao" @click="toInspectResuit(row)">巡检结果</li>
              <li class="tsfont-file-single" @click="toProblemReport(row)">问题报告</li>
            </ul>
          </div>
        </template>
      </TsTable>
    </template>
  </TsContain>
</template>
<script>
export default {
  name: 'JobManage', // 巡检作业
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    CombineSearcher: resolve => require(['@/resources/components/CombineSearcher/CombineSearcher.vue'], resolve),
    Liquid: resolve => require(['@/resources/components/SimpleGraph/Liquid.vue'], resolve),
    Status: resolve => require(['@/resources/components/Status/CommonStatus.vue'], resolve)
  },
  filters: {},
  props: {},
  data() {
    return {
      timmer: null,
      searchParam: {},
      searchValue: {},
      jobData: {},
      jobEndStatusList: ['completed', 'aborted', 'ignored', 'failed'], //终点状态节点列表，非终点状态列表的需要定时刷新。
      theadList: [
        /* {
          title: '#',
          key: 'id'
        },*/
        {
          title: '名称',
          key: 'name',
          type: 'linktext',
          textValue: 'view'
        },
        {
          title: '来源类目',
          key: 'operationType'
        },
        {
          title: '来源',
          key: 'sourceName'
        },
        {
          title: '起止时间',
          key: 'startTime',
          keyend: 'endTime',
          type: 'startEndTime'
        },
        {
          title: '状态',
          key: 'status'
        },
        {
          title: '执行情况',
          key: 'completionRate'
        },
        {
          title: '耗时',
          key: 'costTime'
        },
        {
          title: '执行用户',
          key: 'execUserVo',
          type: 'user',
          uuid: 'uuid'
        },
        { 
          key: 'action' 
        }
      ],
      searchConfig: {
        search: false,
        searchList: [
          {
            type: 'text',
            name: 'combopName',
            label: '组合工具'
          },
          {
            type: 'select',
            name: 'statusList',
            label: '作业状态',
            multiple: true,
            url: '/api/rest/universal/enum/get',
            params: { enumClass: 'neatlogic.framework.autoexec.constvalue.JobStatus' },
            transfer: true
          },
          {
            type: 'userselect',
            name: 'execUserList',
            label: '操作人',
            groupList: ['user'],
            transfer: true
          },
          {
            type: 'timeselect',
            name: 'startTime',
            label: '执行时间',
            transfer: true
          }
        ]
      }
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
    searchJob(currentPage) { 
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      const param = { ...this.searchParam, ...this.searchValue };
      this.$addHistoryData('searchValue', this.searchValue);
      this.$addHistoryData('searchParam', this.searchParam);
      this.$api.inspect.inspectJob.getInspectJobList(param).then(res => {
        this.jobData = res.Return;
        const idList = [];
        if (this.jobData.tbodyList && this.jobData.tbodyList.length > 0) {
          this.jobData.tbodyList.forEach(element => {
            if (!this.jobEndStatusList.includes(element.status)) {
              idList.push(element.id);
            }
          });
          if (idList.length > 0) {
            this.timmer = setTimeout(() => { this.refresh(idList); }, 5000);
          }
        }
      });
    },
    refresh(idList) {
      if (this.timmer) {
        clearTimeout(this.timmer);
        this.timmer = null;
      }
      this.$api.inspect.inspectJob.getInspectJobList({needPage: false, idList: idList}).then(res => {
        const jobList = res.Return.tbodyList;
        const newIdList = [];
        if (jobList && jobList.length > 0) {
          jobList.forEach(job => {
            const index = this.jobData.tbodyList.findIndex(d => d.id === job.id);
            if (index >= 0) {
              this.$set(this.jobData.tbodyList, index, job);
            }
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
    restoreHistory(historyData) {
      if (historyData['searchParam']) {
        this.searchParam = historyData['searchParam'];
      }
      if (historyData['searchValue']) {
        this.searchValue = historyData['searchValue'];
      }
    },
    toJobDetail(row) {
      this.$router.push({
        path: '/job-detail',
        query: {id: row.id, status: row.status}
      });
    },
    toInspectResuit(row) {
      this.$router.push({
        path: '/inspect-result',
        query: {jobId: row.id, startTime: row.startTime, execUser: row.execUser}
      });
    },
    toProblemReport(row) {
      this.$router.push({
        path: '/question-report',
        query: {jobId: row.id, startTime: row.startTime, execUser: row.execUser}
      });
    },
    goDetail(row) {
      // 根据不同的类型，跳转不同的详情页面
      let url = '';
      if (row.operationType == 'combop') {
        // 组合工具详情
        url = 'action-detail?id=' + row.operationId;
      } else if (row.operationType == 'script') {
        // 工具详情
        url = 'script-detail?versionId=' + row.operationId + '&status=' + row.status;
      }
      this.$router.push({
        path: url
      });
    }
  },
  computed: {
    getconfig() {
      return row => {
        let config = {};
        config.status = row.status;
        row.status == 'running' ? config.status = 'active'
          : row.status == 'error' ? config.status = 'wrong' : '';
        return config;
      };
    }
  },
  watch: {}
};
</script>
