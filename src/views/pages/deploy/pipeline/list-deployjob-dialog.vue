<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <div>
          <div class="mb-nm">
            <TsRow>
              <Col :span="12"></Col>
              <Col :span="12">
                <CombineSearcher v-model="searchValue" v-bind="searchConfig" @change="searchDeployPipeline(1)"></CombineSearcher>
              </Col>
            </TsRow>
          </div>
          <div>
            <DeployPipelineTable
              ref="tableData"
              :defaultSearchParam="searchParam"
              :fixedHeader="false"
              :isNeedRefresh="false"
            ></DeployPipelineTable>
          </div>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    CombineSearcher: () => import('@/resources/components/CombineSearcher/CombineSearcher.vue'),
    DeployPipelineTable: () => import('@/views/pages/deploy/job/publishing/deploy-pipeline-table.vue')
  },
  props: {
    id: { type: Number },
    invokeIdList: Array //定时作业引用id
  },
  data() {
    return {
      isLoading: false,
      searchValue: {},
      searchConfig: { search: true,
        labelPosition: 'top',
        searchList: [
          {
            type: 'select',
            name: 'envId',
            label: this.$t('page.environment'),
            url: '/api/rest/resourcecenter/appenv/list/forselect',
            params: { needPage: false },
            rootName: 'tbodyList',
            textName: 'name',
            valueName: 'id',
            transfer: true
          },
          {
            type: 'daterange',
            name: 'startTimeRange',
            label: this.$t('term.autoexec.executiontime'),
            format: 'yyyy-MM-dd',
            transfer: true,
            placeholder: this.$t('term.deploy.pleaseselecttimeperiod')
          },
          {
            type: 'userselect',
            name: 'execUserList',
            label: this.$t('term.deploy.executor'),
            groupList: ['user'],
            multiple: true,
            transfer: true
          },
          {
            type: 'select',
            name: 'statusList',
            label: this.$t('page.jobstatus'),
            multiple: true,
            url: '/api/rest/universal/enum/get',
            params: { enumClass: 'JobStatus' },
            transfer: true
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
          }
        ]
      },
      searchParam: {pipelineId: this.id, invokeIdList: this.invokeIdList},
      dialogConfig: {
        title: this.$t('term.deploy.joblist'),
        type: 'slider',
        maskClose: true,
        isShow: true,
        width: 'large',
        hasFooter: false
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    searchDeployPipeline(currentPage) {
      if (this.$refs.tableData) {
        this.$refs.tableData.searchJob(currentPage, this.searchValue);
      }
    },
    close() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {
  },
  watch: {}
};
</script>
<style lang="less" scoped>
</style>
