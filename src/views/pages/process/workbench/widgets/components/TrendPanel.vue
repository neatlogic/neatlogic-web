<template>
  <PortalCard
    :title="showTitle ? title : ''"
    :loading="loading"
    :error="error"
    :empty="isEmpty"
  >
    <template v-slot:action>近7天</template>
    <div class="trend-panel">
      <div class="legend text-right">
        <span v-for="line in chartData.series" :key="line.name" class="ml-md text-grey">
          <i class="mr-xs" :style="{ backgroundColor: line.color }"></i>{{ line.name }}
        </span>
      </div>
      <svg viewBox="0 0 520 180" preserveAspectRatio="none">
        <line
          v-for="y in [30, 70, 110, 150]"
          :key="y"
          x1="0"
          :y1="y"
          x2="520"
          :y2="y"
          stroke="var(--table-hover-color)"
        />
        <polyline
          v-for="line in lines"
          :key="line.name"
          :points="line.points"
          :stroke="line.color"
          fill="none"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></polyline>
      </svg>
      <div class="axis text-grey text-center">
        <span v-for="label in chartData.labels" :key="label">{{ label }}</span>
      </div>
    </div>
  </PortalCard>
</template>

<script>
import PortalCard from './PortalCard.vue';

export default {
  name: 'TrendPanel',
  components: { PortalCard },
  props: {
    widget: { type: Object },
    config: { type: Object, default: () => ({}) },
    title: { type: String, default: '工单趋势（近7天）' },
    showTitle: { type: Boolean, default: true }
  },
  data() {
    return {
      loading: false,
      error: '',
      chartData: {
        labels: [],
        series: []
      }
    };
  },
  computed: {
    isEmpty() {
      return !(this.chartData.series || []).length;
    },
    lines() {
      return this.chartData.series.map(line => {
        const max = 32;
        const points = line.values.map((value, index) => {
          const x = line.values.length > 1 ? index * (520 / (line.values.length - 1)) : 0;
          const y = 160 - (value / max) * 130;
          return `${x},${y}`;
        }).join(' ');
        return { ...line, points };
      });
    }
  }
};
</script>

<style lang="less" scoped>
.trend-panel {
  min-height: 206px;
  .legend {
    height: 22px;
    span {
      font-size: 12px;
    }
    i {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
  }
  svg {
    width: 100%;
    height: 152px;
  }
  .axis {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    font-size: 12px;
  }
}
</style>
