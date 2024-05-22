<template>
  <TsUlList
    v-if="historyData && historyData.tbodyList"
    :value="id"
    :dataList="historyData.tbodyList"
    v-bind="historyData"
    :isToggle="true"
    valueName="_id"
    pager="scroll"
    :height="height"
    @on-click="changeHistoryId"
    @updatePage="searchHistory"
  >
    <template slot-scope="{ row }">
      <div>
        <span :class="row.status.cssClass" class="mr-xs">{{ row.id }}{{ row.status.text }}</span>
        <span>{{ times(row._report_time) | formatTimeCost({ unitNumber: 1, language: 'zh', unit: 'minute' }) }}{{ $t('page.before') }}</span>
      </div>
    </template>
  </TsUlList>
</template>
<script>
export default {
  name: '',
  components: {
    TsUlList: () => import('@/resources/components/TsUlList/TsUlList.vue')
  },
  filters: {},
  props: {
    id: {type: String},
    resourceId: { type: Number },
    height: {type: Number}
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
    changeHistoryId(id) {
      this.$emit('change', id);
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchHistory(1);
    },
    searchHistory(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      this.$api.inspect.assetsInspect.getHistory(this.searchParam).then(res => {
        if (this.searchParam.currentPage == 1) {
          this.historyData = res.Return;
        } else if (this.searchParam.currentPage > 1) {
          if (res.Return.tbodyList.length > 0) {
            this.$set(this.historyData, 'currentPage', res.Return.currentPage);
            this.historyData.tbodyList.push(...res.Return.tbodyList);
          }
        }
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
