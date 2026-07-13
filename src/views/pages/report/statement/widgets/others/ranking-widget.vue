<template>
  <div class="screen-ranking" :class="{ 'is-title-hidden': !showTitle }" :style="rankingStyle">
    <div v-if="showTitle" class="ranking-title" :style="{ color: titleColor }">{{ rankingTitle }}</div>
    <div class="ranking-list">
      <div v-for="(item, index) in rankingList" :key="index" class="ranking-item">
        <span class="ranking-index">{{ index + 1 }}</span>
        <span class="ranking-name overflow" :title="item.name">{{ item.name }}</span>
        <span class="ranking-value">{{ item.value }}</span>
        <span class="ranking-bar">
          <span class="ranking-bar-inner" :style="{ width: item.percent + '%' }"></span>
        </span>
      </div>
    </div>
  </div>
</template>
<script>
import { WidgetBase } from '../widget-base.js';
import { $t } from '@/resources/init.js';

const DEFAULT_RANKING_LIST = [
  { name: $t('term.report.servicerequest'), value: 128 },
  { name: $t('term.report.changeticket'), value: 96 },
  { name: $t('term.report.autoexecexecution'), value: 78 },
  { name: $t('term.report.inspectiontask'), value: 62 },
  { name: $t('term.report.alertevent'), value: 45 },
  { name: $t('term.report.releasetask'), value: 38 }
];

export default {
  name: '',
  extends: WidgetBase,
  methods: {
    normalizeRankingItem(item) {
      return {
        name: item && item.name ? item.name : '--',
        value: Number(item && item.value) || 0
      };
    }
  },
  computed: {
    rankingList() {
      const list = this.sourceList
        .map(item => this.normalizeRankingItem(item))
        .sort((a, b) => b.value - a.value)
        .slice(0, this.widget.config.topN || 6);
      const max = Math.max(...list.map(item => Number(item.value) || 0), 1);
      return list.map(item => ({
        ...item,
        percent: Math.max(6, Math.round(((Number(item.value) || 0) / max) * 100))
      }));
    },
    sourceList() {
      if (this.data && this.data.length > 0) {
        return this.data.map(item => ({
          name: item.name || '--',
          value: item.value || 0
        }));
      }
      return DEFAULT_RANKING_LIST;
    },
    rankingTitle() {
      return (this.widget.config && this.widget.config.title) || this.$t('term.report.topranking');
    },
    showTitle() {
      return !(this.widget.config && this.widget.config.showTitle === false);
    },
    titleColor() {
      return (this.widget.config && this.widget.config.titleColor) || this.widget.color || '#00e5ff';
    },
    nameColor() {
      return (this.widget.config && this.widget.config.nameColor) || this.getChartTheme()?.labels?.style?.fill || 'rgba(233, 251, 255, 0.88)';
    },
    rankingStyle() {
      return {
        '--ranking-primary-color': this.widget.color || '#00e5ff',
        '--ranking-accent-color': this.widget.accentColor || '#00ffa8',
        '--ranking-title-color': this.titleColor,
        '--ranking-name-color': this.nameColor
      };
    }
  }
};
</script>
<style lang="less" scoped>
.screen-ranking {
  --ranking-primary-color: #00e5ff;
  --ranking-accent-color: #00ffa8;
  --ranking-name-color: rgba(233, 251, 255, 0.88);
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 16px;
  overflow: hidden;
  color: #e9fbff;
}
.ranking-title {
  height: 26px;
  color: var(--ranking-title-color);
  font-size: 16px;
  text-shadow: 0 0 12px fade(#00e5ff, 48%);
}
.ranking-list {
  height: calc(100% - 28px);
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}
.screen-ranking.is-title-hidden .ranking-list {
  height: 100%;
}
.ranking-item {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) 54px;
  grid-template-rows: 22px 6px;
  column-gap: 8px;
  align-items: center;
}
.ranking-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  color: #001019;
  background: linear-gradient(135deg, var(--ranking-primary-color), var(--ranking-accent-color));
  font-weight: 700;
}
.ranking-name {
  color: var(--ranking-name-color);
}
.ranking-value {
  color: var(--ranking-accent-color);
  text-align: right;
  font-family: Arial, Helvetica, sans-serif;
}
.ranking-bar {
  grid-column: 2 / 4;
  height: 5px;
  overflow: hidden;
  background: fade(#ffffff, 10%);
}
.ranking-bar-inner {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--ranking-primary-color), var(--ranking-accent-color));
  box-shadow: 0 0 12px fade(#00e5ff, 45%);
}
</style>
