<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <TsTable
          :fixedHeader="false"
          :theadList="theadList"
          v-bind="reportDataSourceAuditData"
          @changeCurrent="updatePage"
          @changePageSize="updatePagesize"
        ></TsTable>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve)
  },
  props: {
    id: { type: Number }
  },
  data() {
    const _this = this;
    return {
      searchParam: {dataSourceId: this.id},
      dialogConfig: {
        type: 'modal',
        maskClose: true,
        isShow: true,
        title: this.$t('term.framework.syncreport'),
        width: 'medium',
        hasFooter: false
      },
      reportDataSourceAuditData: {},
      theadList: [
        { key: 'startTime', title: this.$t('page.starttime'), type: 'time'},
        { key: 'endTime', title: this.$t('page.endtime'), type: 'time'},
        { key: 'dataCount', title: this.$t('page.datacapacity') },
        { key: 'error', title: this.$t('page.exception') }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.searchAudit();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    updatePage(page) {
      this.searchAudit(page);
    },
    updatePagesize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchAudit();
    },
    searchAudit(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      } else {
        this.searchParam.currentPage = 1;
      }
      this.$api.framework.datawarehouse.searchDataSourceAudit(this.searchParam).then(res => {
        this.reportDataSourceAuditData = res.Return;
      });
    },
    close: function() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
