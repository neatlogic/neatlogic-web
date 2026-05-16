<template>
  <div class="dashboard-table-widget">
    <TsTable
      ref="table"
      :isAutoScroll="widget.config && widget.config.autoscroll ? true : false"
      :fixedHeader="widget.config && widget.config.autoscroll ? true : false"
      :theadList="theadList"
      v-bind="tableData"
      :height="tableHeight"
    ></TsTable>
  </div>
</template>
<script>
import { WidgetBase } from '../widget-base.js';
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue')
  },
  extends: WidgetBase,
  props: {},
  data() {
    return {
      tableData: {
        theadList: [
          { key: 'c1', title: this.$t('page.col') + '1' },
          { key: 'c2', title: this.$t('page.col') + '2' }
        ],
        tbodyList: [
          { c1: this.$t('page.data') + '1', c2: this.$t('page.data') + '2' },
          { c1: this.$t('page.data') + '3', c2: this.$t('page.data') + '4' }
        ]
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
  methods: {},
  filter: {},
  computed: {
    theadList() {
      if (this.tableData && this.tableData.theadList) {
        return this.tableData.theadList.filter(d => d.key && d.key.startsWith('field_'));
      }
      return [];
    },
    tableHeight() {
      return this.height > 200 ? Math.max(this.height - 22, 0) : 200;
    },
    style() {
      const style = {};
      if (this.widget.config) {
        if (this.widget.config.fontsize) {
          style['font-size'] = this.widget.config.fontsize + 'px';
        }
      }
      return style;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.dashboard-table-widget {
  height: 100%;
}
</style>
