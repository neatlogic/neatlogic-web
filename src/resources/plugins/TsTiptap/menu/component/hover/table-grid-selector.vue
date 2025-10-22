<template>
  <div class="table-grid-selector" @mouseleave="resetHover">
    <div class="header">
      <span>插入支持富文本的表格</span>
      <span class="count">{{ hoverCol }} × {{ hoverRow }}</span>
    </div>

    <div class="grid">
      <div
        v-for="r in rows"
        :key="'r-' + r"
        class="row"
      >
        <div
          v-for="c in cols"
          :key="'c-' + c"
          class="cell"
          :class="{ active: c <= hoverCol && r <= hoverRow }"
          @mouseenter="handleHover(r, c)"
          @click="selectTable(r, c)"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TableGridSelector',
  props: {
    initialRows: { type: Number, default: 8 },
    initialCols: { type: Number, default: 8 }
  },
  data() {
    return {
      rows: 8,
      cols: 8,
      hoverRow: 0,
      hoverCol: 0
    };
  },
  methods: {
    handleHover(r, c) {
      // 成对高亮模式
      this.hoverRow = r;
      this.hoverCol = c;
    },
    resetHover() {
      this.hoverRow = 0;
      this.hoverCol = 0;
    },
    selectTable(r, c) {
      const rowCount = r;
      this.$emit('select', { rows: rowCount, cols: c });
    }
  }
};
</script>

<style scoped>
.table-grid-selector {
  width: 210px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 8px;
  background: #fff;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  user-select: none;
}

.header {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 6px;
  color: #555;
}

.grid {
  display: flex;
  flex-direction: column;
  border: 1px solid #eee;
  background: #fafafa;
  padding: 8px;
  transition: all 0.2s ease;
}

.row {
  display: flex;
}

.cell {
  width: 18px;
  height: 18px;
  margin: 2px;
  background: #f3f3f3;
  border-radius: 3px;
  transition: background 0.15s, transform 0.15s;
}

.cell:hover {
  transform: scale(1.05);
}

.cell.active {
  background: #7eaaff;
}
</style>
