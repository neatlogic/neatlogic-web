<template>
  <TsContain :siderWidth="258" :enableCollapse="true">
    <template v-slot:content>
      <div class="gantt" :style="{ '--left': left + 'px' }">
        <div ref="labels" class="gantt-labels">
          <TsTable
            :tbodyList="tbodyList"
            :theadList="theadList"
            @scroll="scrollTable"
          >
            <template v-slot:start="{ row }">{{ formatDate(row.start) }}</template>
            <template v-slot:end="{ row }">{{ formatDate(row.end) }}</template>
          </TsTable>
        </div>
        <div class="divider" @mousedown="startResize"></div>
        <div ref="chart" class="gantt-chart">
          <GanttChar :data="tbodyList" :cellsize="38.89"></GanttChar>
        </div>
      </div>
    </template>
  </TsContain>
</template>
<script>
import * as d3 from 'd3';

export default {
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    GanttChar: resolve => require(['@/views/pages/rdm/project/viewtab/gantt/gantt-char.vue'], resolve)
  },
  props: {},
  data() {
    return {
      left: 800,
      cellSize: 30,
      tasks: Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        name: `Task ${i + 1}`,
        start: new Date(2023, 0, 1 + i),
        end: new Date(2023, 0, 1 + i + Math.floor(Math.random() * 90))
      })),
      theadList: [{key: 'name', title: '名称'}, {key: 'start', title: '开始'}, {key: 'end', title: '结束'}],
      tbodyList: Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        name: `Task ${i + 1}`,
        start: new Date(2023, 0, 1 + i),
        end: new Date(2023, 0, 1 + i + Math.floor(Math.random() * 90))
      })),
      cellWidth: 20 // 单元格宽度，以像素为单位
    };
  },
  mounted() {
    window.addEventListener('mousemove', this.doResize);
    window.addEventListener('mouseup', this.stopResize);
  },
  beforeDestroy() {
    window.removeEventListener('mousemove', this.doResize);
    window.removeEventListener('mouseup', this.stopResize);
  },
  methods: {
    formatDate(date) {
      return d3.timeFormat('%Y-%m-%d')(date);
    },
    scrollTable(e) {
      this.$refs.chart.scrollTop = e.target.scrollTop;
    },
    startResize(e) {
      this.resizing = true;
      this.startX = e.clientX;
      this.oldLeft = this.left;
    },
    doResize(e) {
      if (!this.resizing) return;
      const dx = e.clientX - this.startX;
      this.left = this.oldLeft - dx;
    },
    stopResize() {
      this.resizing = false;
    }
  },
  computed: {
    scale() {
      const start = d3.min(this.tasks, task => task.start);
      const end = d3.max(this.tasks, task => task.end);
      return d3
        .scaleTime()
        .domain([start, end])
        .range([0, this.days * this.cellSize]);
    },
    days() {
      const start = d3.min(this.tasks, task => task.start);
      const end = d3.max(this.tasks, task => task.end);
      return d3.timeDay.count(start, end);
    }
  }
};
</script>

<style scoped>
.gantt {
  display: grid;
  grid-template-columns: calc(100vw - 5px - var(--left)) 5px auto;
  height: 100vh;
  width: 100%;
}

.gantt-labels,
.gantt-chart {
  overflow: hidden;
}

.divider {
  width: 5px;
  background-color: #ccc;
  cursor: ew-resize;
  height:400px;
}
</style>
