<template>
  <div class="screen-progress" :class="{ 'is-title-hidden': !showTitle }" :style="progressStyle">
    <div v-if="showTitle" class="progress-title" :style="{ color: titleColor }">{{ progressTitle }}</div>
    <div class="progress-list">
      <div
        v-for="(item, index) in progressList"
        :key="index"
        class="progress-item"
        :class="'status-' + item.status"
      >
        <div class="progress-row">
          <span class="progress-name overflow" :title="item.name">{{ item.name }}</span>
          <span v-if="showValue" class="progress-value">{{ item.valueText }}</span>
        </div>
        <Progress
          class="progress-bar"
          :percent="item.percent"
          :stroke-width="barHeight"
          :stroke-color="item.strokeColor"
          :status="item.progressStatus"
          :hide-info="!textInside"
          :text-inside="textInside"
        ></Progress>
        <div v-if="showTarget && item.targetText" class="progress-target">{{ item.targetText }}</div>
      </div>
    </div>
  </div>
</template>
<script>
import { WidgetBase } from '../widget-base.js';
import { $t } from '@/resources/init.js';

const DEFAULT_PROGRESS_LIST = [
  { name: $t('term.report.corelinkavailability'), value: 98.6, target: 100, status: 'normal' },
  { name: $t('term.report.networkdeviceonline'), value: 96.8, target: 100, status: 'normal' },
  { name: $t('term.report.cpuusage'), value: 72, target: 100, status: 'warning' },
  { name: $t('term.report.memoryusage'), value: 64, target: 100, status: 'normal' },
  { name: $t('term.report.alertresolutionrate'), value: 88, target: 100, status: 'critical' }
];

const VALID_STATUS = ['normal', 'warning', 'critical', 'offline'];

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clampPercent(value) {
  return Math.min(Math.max(value, 0), 100);
}

export default {
  name: '',
  extends: WidgetBase,
  methods: {
    normalizeStatus(status) {
      const value = status ? String(status).toLowerCase() : 'normal';
      return VALID_STATUS.includes(value) ? value : 'normal';
    },
    normalizeProgressItem(item) {
      const value = toNumber(item && item.value);
      const target = toNumber(item && item.target);
      const percent = target > 0 ? (value / target) * 100 : value;
      const safePercent = clampPercent(percent);
      const status = this.normalizeStatus(item && item.status);
      return {
        name: item && item.name ? item.name : '--',
        value,
        target,
        status,
        percent: safePercent,
        valueText: `${Number(safePercent.toFixed(2))}%`,
        targetText: target > 0 ? this.$t('term.report.currenttargettext', { current: Number(value.toFixed(2)), target: Number(target.toFixed(2)) }) : '',
        strokeColor: this.getStrokeColor(status),
        progressStatus: this.getProgressStatus(status, safePercent)
      };
    },
    getStrokeColor(status) {
      const colorMap = {
        normal: [this.widget.color || '#00e5ff', this.widget.accentColor || '#00ffa8'],
        warning: [this.widget.color || '#00e5ff', '#ffd166'],
        critical: ['#ff7d7d', '#ffce4a'],
        offline: '#7f8b99'
      };
      return colorMap[status] || colorMap.normal;
    },
    getProgressStatus(status, percent) {
      if (status === 'critical' || status === 'offline') {
        return 'wrong';
      }
      if (percent >= 100) {
        return 'success';
      }
      return 'active';
    }
  },
  computed: {
    sourceList() {
      if (this.data && this.data.length > 0) {
        return this.data.map(item => ({
          name: item.name || '--',
          value: item.value || 0,
          target: item.target,
          status: item.status
        }));
      }
      return DEFAULT_PROGRESS_LIST;
    },
    progressList() {
      return this.sourceList
        .map(item => this.normalizeProgressItem(item))
        .slice(0, this.widget.config.itemCount || 5);
    },
    progressTitle() {
      return (this.widget.config && this.widget.config.title) || this.$t('term.report.resourceusage');
    },
    showTitle() {
      return this.widget.config && this.widget.config.showTitle === true;
    },
    showValue() {
      return !(this.widget.config && this.widget.config.showValue === false);
    },
    showTarget() {
      return this.widget.config && this.widget.config.showTarget === true;
    },
    textInside() {
      return this.widget.config && this.widget.config.textInside === true;
    },
    titleColor() {
      return (this.widget.config && this.widget.config.titleColor) || this.widget.color || '#00e5ff';
    },
    nameColor() {
      return (this.widget.config && this.widget.config.nameColor) || this.getChartTheme()?.labels?.style?.fill || 'rgba(233, 251, 255, 0.88)';
    },
    barHeight() {
      return Math.max(Number(this.widget.config && this.widget.config.barHeight) || 8, 4);
    },
    progressStyle() {
      return {
        '--progress-primary-color': this.widget.color || '#00e5ff',
        '--progress-accent-color': this.widget.accentColor || '#00ffa8',
        '--progress-title-color': this.titleColor,
        '--progress-name-color': this.nameColor,
        '--progress-bar-height': `${this.barHeight}px`
      };
    }
  }
};
</script>
<style lang="less" scoped>
.screen-progress {
  --progress-primary-color: #00e5ff;
  --progress-accent-color: #00ffa8;
  --progress-title-color: #00e5ff;
  --progress-name-color: rgba(233, 251, 255, 0.88);
  --progress-bar-height: 8px;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 16px;
  overflow: hidden;
  color: #e9fbff;
}
.progress-title {
  height: 28px;
  color: var(--progress-title-color);
  font-size: 16px;
  text-shadow: 0 0 12px fade(#00e5ff, 48%);
}
.progress-list {
  height: calc(100% - 28px);
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  gap: 8px;
}
.screen-progress.is-title-hidden .progress-list {
  height: 100%;
}
.progress-item {
  min-height: 34px;
}
.progress-row {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 22px;
}
.progress-name {
  flex: 1;
  min-width: 0;
  color: var(--progress-name-color);
}
.progress-value {
  color: var(--progress-accent-color);
  font-family: Arial, Helvetica, sans-serif;
  font-weight: 700;
}
.progress-bar {
  margin-top: 2px;
  /deep/ .ivu-progress-inner {
    background-color: fade(#ffffff, 10%);
    border-radius: 0;
  }
  /deep/ .ivu-progress-bg {
    border-radius: 0;
    box-shadow: 0 0 12px fade(#00e5ff, 45%);
  }
}
.progress-target {
  margin-top: 3px;
  color: fade(#e9fbff, 58%);
  font-size: 12px;
  text-align: right;
}
.status-warning .progress-value {
  color: #ffd166;
}
.status-critical .progress-value {
  color: #ff7d7d;
}
.status-offline {
  opacity: 0.62;
}
.status-offline .progress-bar /deep/ .ivu-progress-bg {
  box-shadow: none;
}
</style>
