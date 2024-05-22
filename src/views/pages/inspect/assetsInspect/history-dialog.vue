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
          <span>{{ times(row._report_time) | formatTimeCost({ unitNumber: 1, language: 'zh', unit: 'minute' }) }}{{ $t('page.before') }}</span>
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
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue')
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
        title: this.$t('term.inspect.historyreport'),
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
          title: this.$t('page.ipaddress'),
          key: 'inspect_resultName'
        },
        {
          title: this.$t('term.autoexec.inspectstatus'),
          key: '_report_timeStatus'
        },
        {
          title: this.$t('page.executeuser'),
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
