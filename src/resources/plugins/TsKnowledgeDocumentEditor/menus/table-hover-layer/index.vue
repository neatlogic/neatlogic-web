<template>
  <div>
    <div
      :style="{
        position: 'absolute',
        top: `${tableMenuPosition.top}px`,
        left: `${tableMenuPosition.left}px`
      }"
      @click.stop
    >
      <ul class="flex-start">
        <template v-if="getTableRowCount">
          <li
            v-for="(row, columnIndex) in getTableRowCount"
            :key="row"
            :style="`width: ${tableMetrics.colsWidthList[columnIndex]}px`"
            style="height: 10px"
            :class="getColClass({row: row, colIndex: columnIndex})"
            @click.stop="handleColClick($event, row, columnIndex)"
          ></li>
        </template>
      </ul>
    </div>
    <div
      :style="{
        position: 'absolute',
        top: `37px`,
        left: `-10px`
      }"
      @click.stop
    >
      <ul>
        <template v-if="getTableColCount">
          <li
            v-for="(col, rowIndex) in getTableColCount"
            :key="col"
            style="width: 10px"
            :style="`height: ${rowHeightList[rowIndex]}px`"
            :class="getRowClass({col: col, rowIndex: rowIndex})"
            @click.stop="handleRowClick($event, col, rowIndex)"
          ></li>
        </template>
      </ul>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
    tableMenuPosition: {
      type: Object,
      default: () => {
        return { top: 0, left: 0 };
      }
    },
    editor: {
      type: Object,
      default: () => {
        return {};
      }
    },
    tableUuid: {
      type: String,
      default: ''
    },
    rowHeightList: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  data() {
    return {
      rowSelected: null,
      colSelected: null
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
    handleRowClick(event, index, rowIndex) {
      this.colSelected = null;
      this.rowSelected = index;
      this.$emit('click', { event: event, index: rowIndex, type: 'row' });
    },
    handleColClick(event, index, columnIndex) {
      this.rowSelected = null;
      this.colSelected = index;
      this.$emit('click', { event: event, index: columnIndex, type: 'column' });
    },
    getColClass({ row, colIndex }) {
      let selectedClassName = 'bg-grey';
      let blockBorderLeftRadius = '';
      if (row == this.colSelected) {
        selectedClassName = 'bg-info';
      }
      const { rows } = this.tableMetrics || {};
      const lastRows = rows - 1;
      if (colIndex == 0) {
        blockBorderLeftRadius = 'block-border-left-radius';
      } 
      if (colIndex == lastRows) {
        blockBorderLeftRadius = 'block-border-right-radius'; 
      }
      return [selectedClassName, blockBorderLeftRadius];
    },
    getRowClass({ col, rowIndex }) {
      let selectedClassName = 'bg-grey';
      let blockBorderLeftRadius = '';
      if (col == this.rowSelected) {
        selectedClassName = 'bg-info';
      }
      const { cols } = this.tableMetrics || {};
      const lastCols = cols - 1;
      if (rowIndex == 0) {
        blockBorderLeftRadius = 'block-border-left-radius';
      } 
      if (rowIndex == lastCols) {
        blockBorderLeftRadius = 'block-border-bottom-radius'; 
      }
      return [selectedClassName, blockBorderLeftRadius];
    }
  },
  filter: {},
  computed: {
    tableMetrics() {
      return (
        this.editor?.editorData?.getTableSizeByUuid(this.tableUuid) || {
          rows: 0,
          cols: 0,
          colsWidthList: []
        }
      );
    },
    getTableRowCount() {
      return this.tableMetrics.rows;
    },
    getTableColCount() {
      return this.tableMetrics.cols;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.block-border-left-radius {
  border-top-left-radius: 5px;
}
.block-border-right-radius {
  border-top-right-radius: 5px;
}
.block-border-bottom-radius {
  border-bottom-left-radius: 5px;
}
</style>
