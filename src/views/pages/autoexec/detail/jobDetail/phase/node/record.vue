<template>
  <div>
    <TsTable
      v-bind="tableConfig"
      :theadList="theadList"
      :fixedHeader="false"
      @changeCurrent="changeCurrent"
      @changePageSize="changePageSize"
    >
      <template v-slot:startTime="{ row }">
        <span v-if="row.startTime" class="overflow" :class="{ 'text-grey': row.isDelete === 1 }">
          <div v-if="row.startTime" class="fz10">
            <span>{{ row.startTime | formatDate }}</span>
            <span class="text-grey ml-xs">{{ $t('page.begin') }}</span>
          </div>
          <div v-if="row.endTime" class="fz10">
            <span>{{ row.endTime | formatDate }}</span>
            <span class="text-grey ml-xs">{{ $t('page.finish') }}</span>
          </div>
        </span>
      </template>
      <template v-slot:execUserVo="{ row }">
        <UserCard v-bind="row.execUserVo"></UserCard>
      </template>
      <template v-slot:status="{ row }">
        <Status :statusValue="row.status" :statusName="row.statusName" type="text"></Status>
      </template>
      <template v-slot:id="{ row }">
        <span v-download="downurl(row)" class="text-href">
          {{ $t('page.downloadlog') }}
        </span>
      </template>
    </TsTable>
    <Loading v-if="isLoading && tableConfig.tbodyList.length <= 0"></Loading>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue'),
    Status: () => import('@/resources/components/Status/CommonStatus.vue')
  },
  directives: { download },
  props: {
    nodeData: { type: Object },
    phaseData: { type: Object }
    //id: [String, Number],
    //jobPhaseId: [Number, String], //剧本id
    //resourceId: [Number, String] //资源id
  },
  data() {
    return {
      searchParam: {
        nodeId: this.nodeData.id,
        jobPhaseId: this.phaseData.id,
        sqlName: this.nodeData.sqlFile || null,
        resourceId: this.nodeData.resourceId || null
      },
      theadList: [
        {
          title: this.$t('page.startstoptime'),
          key: 'startTime'
        },
        {
          title: this.$t('page.timecost'),
          key: 'costTime'
        },
        {
          title: this.$t('page.executeuser'),
          key: 'execUserVo'
        },
        {
          title: this.$t('page.status'),
          key: 'status'
        },
        {
          title: this.$t('page.result'),
          key: 'id'
        }
      ],
      tableConfig: {
        tbodyList: [],
        pageSize: 20,
        currentPage: 1
      },
      isLoading: false
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.searchRecord(1);
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    changeCurrent(currentPage) {
      this.searchRecord(currentPage);
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchRecord(1);
    },
    searchRecord(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      this.isLoading = true;
      this.$api.autoexec.job.getNodeRecord(this.searchParam).then(res => {
        this.tableConfig = res.Return;
      }).finally(() => {
        this.isLoading = false;
      });
    }
  },
  computed: {
    downurl() {
      return row => {
        let data = {
          resourceId: this.nodeData.resourceId,
          nodeId: this.nodeData.id,
          jobPhaseId: this.phaseData.id,
          startTime: row.startTime,
          status: row.status,
          execUser: row.execUser,
          sqlName: this.nodeData.sqlFile
        };
        return { url: '/api/binary/autoexec/job/phase/node/audit/download', params: data, method: 'post' };
      };
    }
  },
  watch: {
  }
};
</script>
<style lang="less"></style>
