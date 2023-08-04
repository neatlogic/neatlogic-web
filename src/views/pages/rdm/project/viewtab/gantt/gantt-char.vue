<template>
  <div>
    <div class="header">
      <table class="chart-header">
        <tr>
          <td
            v-for="(value, key) in dateRange()"
            :key="key"
            style="text-align: center"
            :colspan="value.length"
          >{{ key }}</td>
        </tr>
        <tr>
          <td
            v-for="(d, index) in dateRange(true)"
            :key="index"
            style="text-align: center"
            :style="{ 'min-width': cellsize + 'px' }"
          >
            {{ d }}
          </td>
        </tr>
      </table>
    </div>
    <div ref="container" class="container" :style="{ height: height + 'px' }">
      <svg
        :height="data.length * cellsize"
        :width="getDateDiff() * cellsize"
      >
        <!-- 网格 -->
        <g v-for="i in getDateDiff()" :key="'v' + i">
          <line
            :x1="i * cellsize"
            :x2="i * cellsize"
            y1="0"
            :y2="data.length * cellsize"
            stroke="#ccc"
            stroke-width="1"
          />
        </g>
        <g v-for="i in data.length + 1" :key="'h' + i">
          <line
            :y1="i * cellsize"
            :y2="i * cellsize"
            x1="0"
            :x2="getDateDiff() * cellsize"
            stroke="#ccc"
            stroke-width="1"
          />
        </g>
        <!-- 任务 -->
        <!--<g v-for="(task, index) in tasks" :key="task.id">
      <rect
        :x="scale(task.start)"
        :y="index * cellSize"
        :width="scale(task.end) - scale(task.start)"
        :height="cellSize"
        fill="blue"
      />
    </g>-->
      </svg>
    </div>
  </div>
</template>
<script>
import moment from 'moment';

export default {
  name: '',
  components: {},
  props: {
    data: { type: Array },
    cellsize: { type: Number }
  },
  data() {
    return {
      height: 0,
      mode: 'day',
      offset: 10 //偏移
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.initHeight();
    window.addEventListener('resize', this.initHeight);
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    window.removeEventListener('resize', this.initHeight);
  },
  destroyed() {},
  methods: {
    initHeight() {
      const svg = this.$refs['container'];
      this.height = window.innerHeight - svg.getBoundingClientRect().top - 20;
    },
    scroll() {},
    dateRange(isFlat) {
      let startDate = moment(this.mindate.format('YYYY-MM-DD'));
      let endDate = moment(this.maxdate.format('YYYY-MM-DD'));

      let dateMap = {};

      if (this.mode === 'day') {
        while (startDate.isSameOrBefore(endDate)) {
          let month = startDate.format('YYYY-MM');
          if (!dateMap[month]) {
            dateMap[month] = [];
          }
          dateMap[month].push(startDate.format('DD'));
          startDate.add(1, 'days');
        }
      } else if (this.mode === 'week') {
        startDate = startDate.startOf('isoWeek');
        endDate = endDate.endOf('isoWeek');
        while (startDate.isSameOrBefore(endDate)) {
          let month = startDate.format('YYYY-MM');
          if (!dateMap[month]) {
            dateMap[month] = [];
          }
          dateMap[month].push(startDate.format('W'));
          startDate.add(1, 'weeks');
        }
      } else if (this.mode === 'month') {
        while (startDate.isSameOrBefore(endDate)) {
          let year = startDate.format('YYYY');
          if (!dateMap[year]) {
            dateMap[year] = [];
          }
          dateMap[year].push(startDate.format('MM'));
          startDate.add(1, 'months');
        }
      } else {
        console.error("Invalid mode! Please enter 'day', 'week' or 'month'.");
      }
      if (!isFlat) {
        return dateMap;
      } else {
        const returnList = [];
        for (let key in dateMap) {
          returnList.push(...dateMap[key]);
        }
        return returnList;
      }
    },
    getDateDiff() {
      switch (this.mode) {
        case 'day':
          return this.maxdate.diff(this.mindate, 'days');
        case 'week':
          return this.maxdate.diff(this.mindate, 'weeks');
        case 'month':
          return this.maxdate.diff(this.mindate, 'months');
        default:
          return null;
      }
    }
  },
  filter: {},
  computed: {
    mindate() {
      let min = new Date(8640000000000000);
      if (this.data && this.data.length) {
        this.data.forEach(d => {
          if (d.start < min) {
            min = d.start;
          }
        });
      } else {
        return null;
      }
      return moment(min);
    },
    maxdate() {
      let max = new Date(-8640000000000000);
      if (this.data && this.data.length) {
        this.data.forEach(d => {
          if (d.end > max) {
            max = d.end;
          }
        });
      } else {
        return null;
      }
      return moment(max);
    }
  },
  watch: {
    data: {
      handler: function(val) {},
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.chart-header {
  border-collapse: collapse;
  th,
  td {
    border: 1px solid #ccc;
  }
}

.header {
  height: 38px;
}
.container {
  overflow: auto;
}
</style>
