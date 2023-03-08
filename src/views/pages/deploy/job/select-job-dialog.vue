<template>
  <TsDialog v-bind="dialogConfig" @on-close="close">
    <template v-slot>
      <div style="text-align:right" class="mb-nm">
        <TsRow>
          <Col :span="12"></Col>
          <Col :span="12">
            <CombineSearcher v-model="searchValue" v-bind="searchConfig" @change="searchJob(1)"></CombineSearcher>
          </Col>
        </TsRow>
      </div>
      <div>
        <TsTable
          v-bind="jobData"
          :theadList="theadList"
          :multiple="true"
          @changeCurrent="searchJob"
          @changePageSize="changePageSize"
          @getSelected="getSelected"
        >
          <template v-slot:name="{ row }">
            <div class="text-href" @click.stop="toJobDetail(row)">{{ row.name }}</div>
          </template>
          <template slot="operationType" slot-scope="{ row }">
            <span class="text-href" @click="toOperationDetail(row)">
              <span>{{ row.operationTypeName }}</span>
              <span v-if="row.operationName">({{ row.operationName }})</span>
            </span>
          </template>
          <template slot="status" slot-scope="{ row }">
            <Status :statusValue="row.status" :statusName="row.statusName" type="text"></Status>
          </template>
          <template v-slot:startTime="{ row }">
            <div v-if="row.startTime" class="fz10">
              <span>{{ row.startTime | formatDate }}</span>
              <span class="text-grey ml-xs">开始</span>
            </div>
            <div v-if="row.endTime" class="fz10">
              <span>{{ row.endTime | formatDate }}</span>
              <span class="text-grey ml-xs">结束</span>
            </div>
          </template>
          <template slot="completionRate" slot-scope="{ row }">
            <Liquid :percent="row.completionRate" :size="7" :config="getStatusConfig(row)" />
          </template>
        </TsTable>
      </div>
    </template>
    <template v-slot:footer>
      <Button @click="close()">取消</Button>
      <Button type="primary" @click="save()">确定</Button>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    Status: resolve => require(['@/resources/components/Status/CommonStatus.vue'], resolve),
    Liquid: resolve => require(['@/resources/components/SimpleGraph/Liquid.vue'], resolve),
    CombineSearcher: resolve => require(['@/resources/components/CombineSearcher/CombineSearcher.vue'], resolve)
  },
  props: {
    excludeIdList: { type: Array }
  },
  data() {
    return {
      dialogConfig: {
        title: '选择作业',
        width: 'large',
        type: 'slider',
        isShow: true
      },
      searchConfig: {
        search: true,
        labelPosition: 'top',
        searchList: [
          {
            type: 'daterange',
            name: 'planStartTimeRange',
            label: '计划时间',
            format: 'yyyy-MM-dd',
            transfer: true
          },
          {
            type: 'daterange',
            name: 'startTimeRange',
            label: '开始时间',
            format: 'yyyy-MM-dd',
            transfer: true
          },
          {
            type: 'daterange',
            name: 'endTimeRange',
            label: '结束时间',
            format: 'yyyy-MM-dd',
            transfer: true
          }
        ]
      },
      jobData: {},
      theadList: [
        { key: 'selection' },
        {
          title: this.$t('page.name'),
          key: 'name'
        },
        {
          title: '来源类目',
          key: 'operationType'
        },
        {
          title: '计划时间',
          key: 'planStartTime',
          type: 'time'
        },
        {
          title: '起止时间',
          key: 'startTime',
          keyend: 'endTime'
        },
        {
          title: '状态',
          key: 'status'
        },
        {
          title: '触发方式',
          key: 'triggerTypeName'
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
      searchParam: {
        excludeIdList: this.excludeIdList,
        sourceList: ['deploy'],
        hasParent: false
      },
      searchValue: {},
      selectedJobList: []
    };
  },
  beforeCreate() {},
  created() {
    this.searchJob();
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
    getSelected(indexList, itemList) {
      this.selectedJobList = itemList;
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchJob(1);
    },
    searchJob(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      const param = { ...this.searchParam, ...this.searchValue };
      this.$api.deploy.job.searchJobList(param).then(res => {
        this.jobData = res.Return;
      });
    },
    save() {
      this.$emit('close', this.selectedJobList);
    },
    close() {
      this.$emit('close');
    },
    toJobDetail(row) {
      this.$router.push({
        path: '/job-detail',
        query: { id: row.id }
      });
    }
  },
  filter: {},
  computed: {
    getStatusConfig() {
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
<style lang="less"></style>
