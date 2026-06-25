<template>
  <div class="screen-metric" :style="metricStyle">
    <div class="metric-title">{{ displayTitle }}</div>
    <div class="metric-value-line">
      <span class="metric-prefix">{{ widget.config.prefix }}</span>
      <span class="metric-value" :style="{ fontSize: valueFontSize }">{{ displayValue }}</span>
      <span class="metric-unit">{{ displayUnit }}</span>
    </div>
    <div v-if="showTrend" class="metric-trend" :class="trendClass">
      <span class="metric-trend-icon">{{ trendIcon }}</span>
      <span>{{ displayTrendLabel }}</span>
      <span class="metric-trend-value">{{ displayTrendValue }}</span>
    </div>
  </div>
</template>
<script>
import { WidgetBase } from '../widget-base.js';

export default {
  name: '',
  extends: WidgetBase,
  data() {
    return {
      currentValue: 0,
      animationFrame: null
    };
  },
  beforeDestroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  },
  methods: {
    getStaticValue(name) {
      const field = this.widget.fields && this.widget.fields.find(item => item.name === name);
      return field && field.value;
    },
    getDataValue(name) {
      const value = this.firstRow[name];
      return value !== undefined && value !== null && value !== '' ? value : undefined;
    },
    getValue(name) {
      const dataValue = this.getDataValue(name);
      return dataValue !== undefined ? dataValue : this.getStaticValue(name);
    },
    formatNumber(value) {
      const decimals = Number(this.widget.config.decimals) || 0;
      const fixed = Number(value || 0).toFixed(decimals);
      if (!this.widget.config.useThousands) {
        return fixed;
      }
      const parts = fixed.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.join('.');
    },
    animateValue(from, to) {
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
      }
      if (this.widget.config.animation === false) {
        this.currentValue = to;
        return;
      }
      const duration = Math.max(Number(this.widget.config.duration) || 1200, 100);
      const start = Date.now();
      const step = () => {
        const progress = Math.min((Date.now() - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        this.currentValue = from + (to - from) * eased;
        if (progress < 1) {
          this.animationFrame = requestAnimationFrame(step);
        }
      };
      step();
    }
  },
  computed: {
    firstRow() {
      return this.data && this.data.length > 0 ? this.data[0] : {};
    },
    displayTitle() {
      const dataTitle = this.getDataValue('title');
      return dataTitle !== undefined ? dataTitle : this.widget.config.title || this.getStaticValue('title') || '核心指标';
    },
    targetValue() {
      const value = this.getValue('value');
      const number = Number(value);
      return Number.isFinite(number) ? number : Number(this.widget.config.defaultValue) || 0;
    },
    displayValue() {
      return this.formatNumber(this.currentValue);
    },
    displayUnit() {
      return this.getValue('unit') || this.widget.config.unit || '';
    },
    showTrend() {
      return this.widget.config.showTrend === true;
    },
    displayTrendLabel() {
      return this.getValue('trendLabel') || 'Trend';
    },
    displayTrendValue() {
      return this.getValue('trendValue') || '0%';
    },
    trendClass() {
      return this.widget.config.trendType === 'down' ? 'is-down' : 'is-up';
    },
    trendIcon() {
      return this.widget.config.trendType === 'down' ? 'v' : '^';
    },
    valueFontSize() {
      return `${this.widget.config.fontSize || 46}px`;
    },
    titleColor() {
      return (this.widget.config && this.widget.config.titleColor) || this.getChartTheme()?.labels?.style?.fill || 'rgba(233, 251, 255, 0.88)';
    },
    metricStyle() {
      return {
        '--metric-primary-color': this.widget.color || '#00e5ff',
        '--metric-accent-color': this.widget.accentColor || '#00ffa8',
        '--metric-title-color': this.titleColor
      };
    }
  },
  watch: {
    targetValue: {
      handler(val, oldVal) {
        this.animateValue(Number(oldVal) || 0, Number(val) || 0);
      },
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.screen-metric {
  --metric-primary-color: #00e5ff;
  --metric-accent-color: #00ffa8;
  --metric-title-color: rgba(233, 251, 255, 0.78);
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 18px 20px;
  overflow: hidden;
  color: #e9fbff;
}
.metric-title {
  position: relative;
  z-index: 1;
  color: var(--metric-title-color);
  font-size: 14px;
}
.metric-value-line {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-top: 12px;
}
.metric-prefix,
.metric-unit {
  color: fade(#e9fbff, 72%);
  font-size: 16px;
}
.metric-value {
  color: var(--metric-primary-color);
  font-family: Arial, Helvetica, sans-serif;
  font-weight: 700;
  line-height: 1;
  text-shadow: 0 0 16px fade(#00e5ff, 50%);
}
.metric-trend {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 14px;
  padding: 4px 10px;
  color: var(--metric-accent-color);
  background: fade(#00ffa8, 10%);
  border: 1px solid fade(#00ffa8, 22%);
}
.metric-trend.is-down {
  color: #ff7d7d;
  background: fade(#ff4d4f, 10%);
  border-color: fade(#ff4d4f, 24%);
}
</style>
