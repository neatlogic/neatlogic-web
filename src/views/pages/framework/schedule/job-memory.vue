<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="closeDialog">
      <template v-slot>
        <div>
          <Loading v-if="isLoading" :loadingShow="isLoading" type="fix"></Loading>
          <div class="clearfix">
            <div class="mb-nm float-right" style="width: 50%">
              <CombineSearcher v-model="searchVal" v-bind="searchConfig" @change="handleSearchChange"></CombineSearcher>
            </div>
          </div>
          <TsTable
            v-if="schedulerMemoryTableData"
            :theadList="theadList"
            v-bind="schedulerMemoryTableData"
            @changeCurrent="changePage"
            @changePageSize="changePageSize"
          >
            <template v-slot:cron="{ row }">
              <div v-if="row.intervalInSeconds">
                <span class="text-grey">间隔</span><span class="text-bold">{{ row.intervalInSeconds }}s</span>
                <span v-if="row.repeatCount" class="ml-xs text-grey">重复</span><span v-if="row.repeatCount" class="text-bold">{{ row.repeatCount }}</span><span v-if="row.repeatCount" class="text-grey">次</span>
              </div>
              <TsQuartz
                v-else
                v-model="row.cron"
                showType="read"
                :transfer="true"
              ></TsQuartz>
            </template>
          </TsTable>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    TsQuartz: () => import('@/resources/plugins/TsQuartz/TsQuartz.vue'),
    CombineSearcher: () => import('@/resources/components/CombineSearcher/CombineSearcher.vue')
  },
  props: {},
  data() {
    return {
      isLoading: false,
      searchVal: {},
      searchConfig: {
        search: false,
        searchList: [
          {
            type: 'select',
            name: 'jobGroupName',
            label: this.$t('page.jobgroupname'),
            dynamicUrl: '/api/rest/scheduler/groupname/search',
            textName: 'text',
            valueName: 'value',
            search: true,
            transfer: true
          },
          {
            type: 'select',
            name: 'jobName',
            label: this.$t('page.jobname'),
            dynamicUrl: '/api/rest/scheduler/name/search',
            params: { jobGroupName: '' },
            textName: 'text',
            valueName: 'value',
            search: true,
            transfer: true,
            disabled: true
          }
        ]
      },
      searchParams: {
        currentPage: 1,
        pageSize: 20,
        jobGroupName: '',
        jobName: ''
      },
      schedulerMemoryTableData: null,
      theadList: [
        {
          title: this.$t('page.jobname'),
          key: 'jobName',
          maxLength: 40
        },
        {
          title: '时间计划',
          key: 'cron'
        },
        {
          title: this.$t('page.type'),
          key: 'type'
        },
        { key: 'state', title: '状态' },
        { key: 'lastFireTime', title: '上次执行时间', type: 'time' },
        { key: 'nextFireTime', title: '下次执行时间', type: 'time' },
        {
          title: this.$t('page.jobgroupname'),
          key: 'jobGroup',
          maxLength: 60
        },
        {
          title: this.$t('term.autoexec.jobhandler'),
          key: 'jobHandler',
          maxLength: 100
        }
      ],
      dialogConfig: {
        type: 'modal',
        title: this.$t('term.autoexec.loadedjob'),
        hasFooter: false,
        maskClose: true,
        isShow: true,
        width: 'large'
      }
    };
  },
  beforeCreate() {},
  created() {
    this.searchMemoryJob();
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
    closeDialog() {
      this.$emit('close');
    },
    changePage(currentPage) {
      this.searchParams.currentPage = currentPage;
      this.searchMemoryJob();
    },
    changePageSize(pageSize) {
      this.searchParams.pageSize = pageSize;
      this.searchMemoryJob();
    },
    handleSearchChange() {
      const jobGroupName = this.searchVal.jobGroupName || '';
      const jobName = this.searchVal.jobName || '';
      if (jobGroupName !== this.searchParams.jobGroupName) {
        this.searchVal.jobName = '';
        this.searchParams.jobName = '';
      }
      this.searchConfig.searchList[1].disabled = !jobGroupName;
      this.searchConfig.searchList[1].params.jobGroupName = jobGroupName;
      this.searchParams.jobGroupName = jobGroupName;
      this.searchParams.jobName = this.searchVal.jobName || jobName;
      this.searchParams.currentPage = 1;
      this.searchParams.pageSize = 20;
      this.searchMemoryJob();
    },
    searchMemoryJob() {
      this.isLoading = true;
      this.$api.framework.schedule
        .searchMemoryJob(this.searchParams)
        .then(res => {
          if (res.Status == 'OK') {
            let tenantLength = res.Return.tenant.length;
            res.Return.tbodyList.forEach(co => {
              if (co.jobName.startsWith(res.Return.tenant)) {
                co.jobName = co.jobName.substr(tenantLength + 1);
              }
              co.jobGroup = co.jobGroup.substr(tenantLength + 1);
            });
            this.schedulerMemoryTableData = res.Return;
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
