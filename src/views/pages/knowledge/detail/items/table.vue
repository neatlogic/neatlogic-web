<template>
  <div uuid_id="uuid" class="tstable-container border bg-grey radius-lg" :class="changeType ? 'table-' + changeType : ''">
    <div class="wrapper">
      <table v-if="config.tableList && config.tableList.length > 0" class="tstable-body">
        <colgroup>
          <col v-for="(w, i) in config.tableList[0]" :key="i" :width="setColWith(w, i, config.headerList)" />
        </colgroup>
        <tbody class="tbody-main">
          <tr v-for="(tr, tindex) in config.tableList" :key="tindex">
            <td
              v-for="(td, dindex) in tr"
              :key="dindex"
              :colspan="getMergeCell(td, 'colspan')"
              :rowspan="getMergeCell(td, 'rowspan')"
            >
              {{ td || '-' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  filters: {},
  mixins: [],
  props: {
    uuid: String,
    content: String,
    config: Object,
    changeType: String
  },
  data() {
    return {};
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
    getMergeCell(td, action) {
      //获取哪些单元格是需要合并的
      if (this.config && this.config.mergeList) {
        let mergecell = this.config.mergeList.find(d => d.row === td.row && d.col === td.col);
        return mergecell && mergecell[action];
      } else {
        return 1;
      }
    }
  },
  computed: {
    setColWith() {
      return function(w, index, headerList) {
        let sum = 0;
        let len = this.config.tableList[0].length;
        headerList = headerList || [];
        for (let i = 0; i < len; i++) {
          headerList[i] = headerList[i] || 170;
        }
        headerList && headerList.forEach(item => {
          sum = sum + Math.floor(item || 170);
        });
        return (headerList[index] || 170) / sum * 100 + '%';
      };
    }
  },
  watch: {
    item: {
      handler: function(val) {},
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/compare.less';
</style>
