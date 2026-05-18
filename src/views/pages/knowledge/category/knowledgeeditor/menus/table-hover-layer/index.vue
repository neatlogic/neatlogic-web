<template>
  <div>
    <div
      :style="{
        position: 'absolute',
        top: `${tableMenuPosition.top}px`,
        left: `${tableMenuPosition.left}px`
      }"
      @click.stop
      @mouseleave.stop="clearSelected"
    >
      <ul class="flex-start">
        <template v-if="getTableRowCount">
          <li
            v-for="(row, columnIndex) in getTableRowCount"
            :key="row"
            :style="`width: ${tableMetrics.colsWidthList[columnIndex]}px`"
            style="height: 10px"
            :class="getColClass({row: row, colIndex: columnIndex, colSelected: colSelected})"
            @click.stop="handleColClick($event, row, columnIndex)"
          ></li>
        </template>
      </ul>
    </div>
    <div
      :style="{
        position: 'absolute',
        top: `${tableMenuPosition.top + 10}px`,
        left: `${tableMenuPosition.left - 10}px`
      }"
      @click.stop
      @mouseleave.stop="clearSelected"
    >
      <ul>
        <template v-if="getTableColCount">
          <li
            v-for="(col, rowIndex) in getTableColCount"
            :key="col"
            style="width: 10px"
            :style="`height: ${rowHeightList[rowIndex]}px`"
            :class="getRowClass({col: col, rowIndex: rowIndex, rowSelected: rowSelected })"
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
    rowHeightList: { // row-height-list
      type: Array,
      default: () => {
        return [];
      }
    },
    isClearHighlight: {
      type: Boolean,
      default: false
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
      this.$emit('click', { event: event, index: rowIndex, type: 'row', rowHeight: this.rowHeightList[rowIndex] });
    },
    handleColClick(event, index, columnIndex) {
      this.rowSelected = null;
      this.colSelected = index;
      let columnHeight = 0;
      if (this.rowHeightList && this.rowHeightList.length) {
        this.rowHeightList.forEach((item) => {
          columnHeight += item;
        });
      }
      this.$emit('click', { event: event, index: columnIndex, type: 'column', columnHeight: columnHeight });
    },
    getColClass({ row, colIndex, colSelected }) {
      let selectedClassName = 'bg-grey';
      let blockBorderLeftRadius = '';
      if (row == colSelected) {
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
    getRowClass({ col, rowIndex, rowSelected }) {
      let selectedClassName = 'bg-grey';
      let blockBorderLeftRadius = '';
      if (col == rowSelected) {
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
    },
    clearSelected() {
      this.rowSelected = null;
      this.colSelected = null;
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
  watch: {
    isClearHighlight: {
      handler(newVal) {
        if (newVal) {
          this.clearSelected();
        }
      },
      deep: true,
      immediate: true
    }
  }
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
