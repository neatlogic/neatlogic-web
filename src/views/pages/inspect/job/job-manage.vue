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
              <li class="tsfont-ipliebiao" @click="toInspectResuit(row)">????????????</li>
              <li class="tsfont-file-single" @click="toProblemReport(row)">????????????</li>
            </ul>
          </div>
        </template>
      </TsTable>
    </template>
  </TsContain>
</template>
<script>
export default {
  name: 'JobManage', // ????????????
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
      jobEndStatusList: ['completed', 'aborted', 'ignored', 'failed'], //????????????????????????????????????????????????????????????????????????
      theadList: [
        /* {
          title: '#',
          key: 'id'
        },*/
        {
          title: '??????',
          key: 'name',
          type: 'linktext',
          textValue: 'view'
        },
        {
          title: '????????????',
          key: 'operationType'
        },
        {
          title: '??????',
          key: 'sourceName'
        },
        {
          title: '????????????',
          key: 'startTime',
          keyend: 'endTime',
          type: 'startEndTime'
        },
        {
          title: '??????',
          key: 'status'
        },
        {
          title: '????????????',
          key: 'completionRate'
        },
        {
          title: '??????',
          key: 'costTime'
        },
        {
          title: '????????????',
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
            label: '????????????'
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
            type: 'userselect',
            name: 'execUserList',
            label: '?????????',
            groupList: ['user'],
            transfer: true
          },
          {
            type: 'timeselect',
            name: 'startTime',
            label: '????????????',
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
      // ???????????????????????????????????????????????????
      let url = '';
      if (row.operationType == 'combop') {
        // ??????????????????
        url = 'action-detail?id=' + row.operationId;
      } else if (row.operationType == 'script') {
        // ????????????
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
