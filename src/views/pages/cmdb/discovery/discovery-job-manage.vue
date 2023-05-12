<template>
  <div>
    <TsContain>
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topRight>
        <CombineSearcher v-model="searchValue" v-bind="searchConfig" @change="searchJob(1)"></CombineSearcher>
      </template>
      <template v-slot:sider>
        <DiscoveryConfList :confId="searchParam.confId" @click="changeConf"></DiscoveryConfList>
      </template>
      <template v-slot:content>
        <div>
          <TsTable
            v-bind="jobData"
            :theadList="theadList"
            @operation="operation"
            @changeCurrent="changeCurrent"
            @changePageSize="changePageSize"
          >
            <template slot="status" slot-scope="{ row }">
              <Status :statusValue="row.status" :statusName="row.statusName" type="text"></Status>
            </template>
          </TsTable>
        </div>
      </template>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    DiscoveryConfList: resolve => require(['./discovery-conf-list.vue'], resolve),
    Status: resolve => require(['@/resources/components/Status/CommonStatus.vue'], resolve),
    CombineSearcher: resolve => require(['@/resources/components/CombineSearcher/CombineSearcher.vue'], resolve)
  },
  props: {},
  data() {
    return {
      timmer: null,
      searchParam: { confId: null },
      searchValue: {},
      jobData: {},
      jobEndStatusList: ['completed', 'aborted', 'ignored', 'failed'], //终点状态节点列表，非终点状态列表的需要定时刷新。
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
        {
          title: this.$t('page.sourcecategory'),
          key: 'operationType'
        },
        {
          title: this.$t('page.source'),
          key: 'sourceName'
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
        }
      ],
      searchConfig: {
        value: {},
        search: false,
        searchList: [
          {
            type: 'text',
            name: 'combopName',
            value: '',
            label: this.$t('term.autoexec.combinationtool')
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
            label: this.$t('term.autoexec.operator'),
            groupList: ['user'],
            transfer: true
          },
          {
            type: 'timeselect',
            name: 'startTime',
            label: this.$t('term.autoexec.executiontime')
          }
        ]
      }
    };
  },
  beforeCreate() {},
  created() {
    this.searchParam.confId = this.$route.params['confId'] || null;
  },
  beforeMount() {},
  mounted() {
    this.searchJob();
  },
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
    operation(row, type) {
      // 点击名称，查看详情信息
      if (type === 'view') {
        this.$router.push({
          path: '/discovery-job-detail',
          query: { id: row.id, status: row.status }
        });
      }
    },
    changeConf(conf) {
      if (this.searchParam.confId === conf.id) {
        this.$set(this.searchParam, 'confId', null);
      } else {
        this.$set(this.searchParam, 'confId', conf.id);
      }
      this.searchJob(1);
    },
    changeCurrent(page) {
      this.searchJob(page);
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
    searchJob(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      const param = { ...this.searchParam, ...this.searchValue };
      this.$addHistoryData('searchValue', this.searchValue);
      this.$addHistoryData('searchParam', this.searchParam);
      this.$api.cmdb.discovery.searchDiscoveryJob(param).then(res => {
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
      this.$api.cmdb.discovery.searchDiscoveryJob({needPage: false, idList: idList}).then(res => {
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
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
