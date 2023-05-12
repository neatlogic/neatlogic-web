<template>
  <div>
    <TsDialog
      v-bind="dialogConfig"
      @on-close="closeDialog"
    > 
      <template v-slot>
        <div>
          <Loading v-if="isLoading" :loadingShow="isLoading" type="fix"></Loading>
          <div class="clearfix">
            <TsRow>
              <div class="mb-nm float-right" style="width:50%">
                <Col :span="12">
                  <TsFormSelect v-model="searchParams.jobGroupName" v-bind="jobGroupNameSetting"></TsFormSelect>
                </Col>
                <Col :span="12">
                  <TsFormSelect v-model="searchParams.jobName" v-bind="jobNameSetting"></TsFormSelect>
                </Col>
              </div>
            </TsRow>
          </div>
          <TsTable
            v-if="schedulerMemoryTableData"
            :theadList="theadList"
            v-bind="schedulerMemoryTableData"
            @changeCurrent="changePage"
            @changePageSize="changePageSize"
          >
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
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  props: {},
  data() {
    return {
      isLoading: false,
      jobGroupNameSetting: {
        type: 'select',
        name: 'jobGroupName',
        value: '',
        placeholder: this.$t('page.jobgroupname'),
        dynamicUrl: '/api/rest/scheduler/groupname/search',
        textName: 'text',
        valueName: 'value',
        search: true,
        transfer: true,
        onChange: (val) => {
          this.changeJobGroupName(val);
        }
      },
      jobNameSetting: {
        type: 'select',
        name: 'jobName',
        value: '',
        placeholder: this.$t('page.jobname'),
        dynamicUrl: '/api/rest/scheduler/name/search',
        params: {jobGroupName: ''},
        textName: 'text',
        valueName: 'value',
        search: true,
        transfer: true,
        disabled: true,
        onChange: (val) => {
          this.changeJobName(val);
        }
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
          title: 'cron',
          key: 'cron'
        },
        {
          title: this.$t('page.type'),
          key: 'type'
        },
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
        type: 'slider',
        title: this.$t('term.autoexec.loadedjob'),
        hasFooter: false,
        maskClose: true,
        isShow: true,
        width: '80%'
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
    changeJobGroupName(jobGroupName) {
      if (!jobGroupName) {
        this.searchParams.jobName = '';
      }
      this.jobNameSetting.disabled = !jobGroupName;
      this.jobNameSetting.params.jobGroupName = jobGroupName;
      this.searchParams.jobGroupName = jobGroupName;
      this.searchParams.currentPage = 1;
      this.searchParams.pageSize = 20;
      this.searchMemoryJob();
    },
    changeJobName(jobName) {
      this.searchParams.jobName = jobName;
      this.searchMemoryJob();
    },
    searchMemoryJob() {
      this.isLoading = true;
      this.$api.framework.schedule.searchMemoryJob(this.searchParams).then(res => {
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
      }).finally(() => {
        this.isLoading = false;
      });
    }
  },
  filter: {},
  computed: {},
  watch: {
  }
};
</script>
<style lang="less">
</style>
