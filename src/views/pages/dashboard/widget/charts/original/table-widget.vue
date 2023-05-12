<template>
  <div>
    <TsTable
      ref="table"
      :isAutoScroll="widget.config && widget.config.autoscroll?true:false"
      :fixedHeader="true"
      v-bind="tableData"
      :height="widget.height-2"
    ></TsTable>
  </div>
</template>
<script>
import { WidgetBase } from '../widget-base.js';
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve)
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
  methods: {
  },
  filter: {},
  computed: {
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
  watch: {
  }
};
</script>
<style lang="less" scoped></style>
