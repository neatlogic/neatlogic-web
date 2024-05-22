<template>
  <div class="padding">
    <TsRow class="pb-nm">
      <Col span="12" class="mt-xs">
        <span class="text-action tsfont-plus" @click="addPipeline()">{{ $t('term.deploy.superpipeline') }}</span>
      </Col>
      <Col span="12">
        <InputSearcher
          v-model="searchParam.keyword"
          @change="searchPipeline(1)"
        ></InputSearcher>
      </Col>
    </TsRow>
    <TsTable
      :theadList="theadList"
      v-bind="pipelineData"
      @changeCurrent="searchPipeline"
      @changePageSize="changePageSize"
    >
      <template v-slot:name="{ row }">
        <a @click="editPipeline(row)">{{ row.name }}</a>
      </template>
      <template v-slot:action="{ row }">
        <div class="tstable-action">
          <ul class="tstable-action-ul">
            <li class="tsfont-list" @click="showJobList(row)">{{ $t('term.deploy.joblist') }}</li>
            <li class="tsfont-plus" @click="addBatchJob(row)">{{ $t('term.deploy.batchjob') }}</li>
            <li class="tsfont-trash-o" @click="deletePipeline(row)">{{ $t('page.delete') }}</li>
          </ul>
        </div>
      </template>
    </TsTable>
    <AddDeployJobDialog v-if="isAddDeployJobDialogShow" :id="currentPipelineId" @close="closeBatchJob"></AddDeployJobDialog>
    <ListDeployJobDialog v-if="isListDeployJobDialogShow" :id="currentPipelineId" @close="closeListJob"></ListDeployJobDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    AddDeployJobDialog: () => import('@/views/pages/deploy/pipeline/add-deployjob-dialog.vue'),
    ListDeployJobDialog: () => import('@/views/pages/deploy/pipeline/list-deployjob-dialog.vue'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue')
  },
  props: {
    appSystemId: Number
  },
  data() {
    return {
      theadList: [
        { title: this.$t('page.name'), key: 'name'},
        { title: this.$t('page.fcu'), key: 'lcu', type: 'user'},
        { title: this.$t('term.deploy.lastrevisiontime'), key: 'lcd', type: 'time' },
        { key: 'action' }],
      isAddDeployJobDialogShow: false,
      isListDeployJobDialogShow: false,
      currentPipelineId: null,
      searchParam: {
        keyword: '',
        type: 'appsystem',
        appSystemId: this.appSystemId
      },
      pipelineData: {}
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.searchPipeline(1);
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    showJobList(row) {
      this.isListDeployJobDialogShow = true;
      this.currentPipelineId = row.id;
    },
    editPipeline(row) {
      this.$router.push({
        path: '/pipeline-edit',
        query: {
          id: row.id,
          type: 'appsystem',
          appSystemId: this.appSystemId
        }
      });
    },
    addPipeline() {
      this.$router.push({
        path: '/pipeline-edit',
        query: {
          type: 'appsystem',
          appSystemId: this.appSystemId
        }
      });
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchPipeline(1);
    },
    searchPipeline(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      this.$api.deploy.pipeline.searchPipeline(this.searchParam).then(res => {
        this.pipelineData = res.Return;
      });
    },
    deletePipeline(row) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: row.name}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.deploy.pipeline
            .deletePipeline(row.id).then(res => {
              this.$Message.success(this.$t('message.deletesuccess'));
              this.searchPipeline(1);
            }).finally(() => {
              vnode.isShow = false;
            });
        }
      });
    },
    addBatchJob(row) {
      this.currentPipelineId = row.id;
      this.isAddDeployJobDialogShow = true;
    },
    closeBatchJob() {
      this.isAddDeployJobDialogShow = false;
    },
    closeListJob() {
      this.isListDeployJobDialogShow = false;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
