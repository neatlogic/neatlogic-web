<template>
  <div>
    <TsContain>
      <template v-slot:topLeft>
        <div class="action-group">
          <span class="action-item tsfont-plus" @click="addPipeline()">{{ $t('term.deploy.superpipeline') }}</span>
        </div>
      </template>
      <template v-slot:topRight>
        <TsRow :gutter="8">
          <Col :span="6">
            <TsFormSelect
              v-model="jobType"
              :dataList="jobTypeDataList"
              border="border"
              @on-change="searchPipeline(1)"
            ></TsFormSelect>
          </Col>
          <Col :span="18">
            <InputSearcher
              v-model="searchParam.keyword"
              @change="searchPipeline(1)"
            ></InputSearcher>
          </Col>
        </TsRow>
      </template>
      <template v-slot:content>
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
      </template>
    </TsContain>
    <AddDeployJobDialog v-if="isAddDeployJobDialogShow" :id="currentPipelineId" @close="closeBatchJob"></AddDeployJobDialog>
    <ListDeployJobDialog v-if="isListDeployJobDialogShow" :id="currentPipelineId" @close="closeListJob"></ListDeployJobDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    AddDeployJobDialog: () => import('./add-deployjob-dialog.vue'),
    ListDeployJobDialog: () => import('./list-deployjob-dialog.vue'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  props: {},
  data() {
    return {
      theadList: [
        { key: 'name', title: this.$t('page.name') },
        { key: 'typeName', title: this.$t('page.type') },
        { key: 'lcu', type: 'user', title: this.$t('page.fcu') },
        { key: 'lcd', title: this.$t('term.deploy.lastrevisiontime'), type: 'time' },
        { key: 'action' }],
      isAddDeployJobDialogShow: false,
      isListDeployJobDialogShow: false,
      currentPipelineId: null,
      searchParam: {keyword: '', type: ''},
      pipelineData: {},
      jobType: 'all',
      jobTypeDataList: []
    };
  },
  beforeCreate() {},
  created() {
    this.gethandlerList();
  },
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
      let params = {
        id: row.id,
        type: row.type
      };
      if (row.appSystemId) {
        this.$set(params, 'appSystemId', row.appSystemId);
      }
      this.$router.push({ path: '/pipeline-edit', query: params});
    },
    addPipeline() {
      this.$router.push({ path: '/pipeline-edit' });
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchPipeline(1);
    },
    searchPipeline(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      if (this.jobType && this.jobType != 'all') {
        this.searchParam.type = this.jobType;
      } else {
        this.$delete(this.searchParam, 'type');
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
    },
    gethandlerList() { //流水线类型
      this.$api.common.getSelectList({enumClass: 'PipelineType'}).then((res) => {
        if (res.Status == 'OK') {
          this.jobTypeDataList = res.Return || [];
          this.jobTypeDataList.unshift({
            value: 'all',
            text: this.$t('page.all')
          });
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
