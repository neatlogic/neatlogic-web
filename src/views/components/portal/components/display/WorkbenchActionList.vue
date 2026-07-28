<template>
  <div :class="['workbench-action-list', { 'is-dense': dense }]">
    <component
      :is="item.href ? 'a' : 'div'"
      v-for="item in visibleItems"
      :key="item.id || item.title"
      :href="item.href || undefined"
      class="action-row text-default border-color"
      @click="$emit('select', item)"
    >
      <div v-if="item.icon" :class="[getBackgroundClass(item.tone), getTextClass(item.tone), 'row-icon radius-md flex-center']">
        <i :class="item.icon"></i>
      </div>
      <Avatar v-else-if="item.avatar" :src="item.avatar" size="small"></Avatar>
      <span v-else :class="[getBackgroundClass(item.tone), 'row-dot radius-sm']"></span>
      <div class="row-main overflow">
        <div class="row-title overflow">{{ item.title }}</div>
        <div v-if="item.description" class="row-description text-grey overflow mt-xs">{{ item.description }}</div>
        <Progress
          v-if="item.progress !== undefined && item.progress !== null"
          :percent="getPercent(item.progress)"
          :stroke-width="4"
          hide-info
          class="row-progress mt-xs"
        ></Progress>
      </div>
      <div class="row-tail">
        <span
          v-if="showStatus && item.status"
          :class="[getTextClass(item.tone), getBackgroundClass(item.tone), 'status-pill radius-sm']"
        >
          {{ item.status }}
        </span>
        <span
          v-else-if="item.actionList && item.actionList.length"
          class="text-action"
          @click.stop.prevent="$emit('action', item.actionList[0], item)"
        >
          {{ item.actionList[0].label }}
        </span>
        <i v-else-if="item.href" class="tsfont-right text-grey"></i>
      </div>
    </component>
    <NoData v-if="visibleItems.length === 0"></NoData>
  </div>
</template>

<script>
import { clampPercent, getToneBackgroundClass, getToneTextClass } from './display-utils.js';

export default {
  name: 'WorkbenchActionList',
  props: {
    items: { type: Array, default: () => [] },
    limit: { type: Number, default: 0 },
    showStatus: { type: Boolean, default: true },
    dense: { type: Boolean, default: false }
  },
  methods: {
    getTextClass(tone) {
      return getToneTextClass(tone);
    },
    getBackgroundClass(tone) {
      return getToneBackgroundClass(tone);
    },
    getPercent(value) {
      return clampPercent(value);
    }
  },
  computed: {
    visibleItems() {
      return this.limit > 0 ? this.items.slice(0, this.limit) : this.items;
    }
  }
};
</script>

<style lang="less" scoped>
.action-row {
  min-height: 52px;
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr) auto;
  gap: 9px;
  align-items: center;
  border-bottom: 1px solid;
  cursor: pointer;
  &:last-child {
    border-bottom: 0;
  }
}
.is-dense .action-row {
  min-height: 44px;
}
.row-icon {
  width: 28px;
  height: 28px;
  font-size: 15px;
}
.row-dot {
  width: 8px;
  height: 8px;
  justify-self: center;
}
.row-main {
  min-width: 0;
}
.row-title {
  font-size: 13px;
  line-height: 18px;
}
.row-description {
  font-size: 11px;
  line-height: 15px;
}
.row-progress {
  max-width: 180px;
}
.row-tail {
  max-width: 92px;
  font-size: 11px;
}
.status-pill {
  display: inline-block;
  max-width: 88px;
  padding: 2px 7px;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
