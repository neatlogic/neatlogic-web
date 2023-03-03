<template>
  <TsDialog v-bind="dialogConfig" @on-close="close">
    <template v-slot>
      <TsTable
        v-bind="historyData"
        :theadList="theadList"
        @changeCurrent="searchHistory"
        @changePageSize="changePageSize"
      >
        <template v-slot:inspect_resultName="{ row }">
          <span class="text-href" @click="openUrl(row)">
            <span>{{ row.MGMT_IP }}</span>
            <span v-if="row.PORT">:{{ row.PORT }}</span>
          </span>
        </template>
        <template v-slot:_report_timeStatus="{ row }">
          <span :class="row.status.cssClass" class="mr-xs">{{ row.status.text }}</span>
          <span>{{ times(row._report_time) | formatTimeCost({ unitNumber: 1, language: 'zh', unit: 'minute' }) }}之前</span>
        </template>
        <template v-slot:_execuser="{ row }">
          <UserCard :initType="row._execuser.initType" :uuid="row._execuser.uuid"></UserCard>
        </template>
      </TsTable>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve)
  },
  filters: {},
  props: {
    resourceId: { type: Number }
  },
  data() {
    return {
      searchParam: {
        resourceId: this.resourceId,
        pageSize: 20,
        currentPage: 1
      },
      dialogConfig: {
        type: 'slider',
        hasFooter: false,
        title: '历史报告',
        maskClose: true,
        isShow: true,
        width: 'large'
      },
      theadList: [
        {
          title: '#',
          key: 'RESOURCE_ID'
        },
        {
          title: 'IP地址',
          key: 'inspect_resultName'
        },
        {
          title: '巡检状态',
          key: '_report_timeStatus'
        },
        {
          title: '执行用户',
          key: '_execuser'
        }
      ],
      historyData: null
    };
  },
  beforeCreate() {},
  created() {
    this.searchHistory();
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
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchHistory(1);
    },
    searchHistory(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      this.$api.inspect.assetsInspect.getHistory(this.searchParam).then(res => {
        this.historyData = res.Return;
      });
    },
    times(time) {
      let data = '-';
      if (time) {
        data = Date.parse(new Date()) - time;
      }
      return data;
    },
    openUrl(row) {
      window.open(HOME + '/inspect.html#/assets-detail-' + row.RESOURCE_ID + '?id=' + row._id, '_blank');
    },
    close() {
      this.$emit('close');
    }
  },
  computed: {},
  watch: {}
};
</script>
<style scoped lang="less"></style>
