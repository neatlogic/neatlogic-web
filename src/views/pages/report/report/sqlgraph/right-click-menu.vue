<template>
  <div
    v-if="isVisible"
    v-click-outside:false="onClickOutside"
    v-click-outside:false.mousedown="onClickOutside"
    class="right-click-menu-box block-border shadow radius-sm bg-grey"
    :style="{ left: `${x}px`, top: `${y}px` }"
  >
    <ul>
      <li
        v-for="(item, index) in menuList"
        :key="index"
        class="cursor-pointer menu-li"
        :class="getGroupDividerClass(item, index)"
        @click.stop="handleMenuClick(item)"
      >
        <div>{{ item.text }}</div>
        <div v-show="item.hotkey"><span class="text-grey">{{ item.hotkey }}</span></div>
      </li>
    </ul>
  </div>
</template>
<script>
import { directive as ClickOutside } from '@/resources/directives/v-click-outside-x.js';
export default {
  name: 'ReportSqlGraphRightClickMenu',
  directives: { ClickOutside },
  props: {
    isVisible: Boolean,
    x: Number,
    y: Number,
    menuList: Array
  },
  methods: {
    handleMenuClick(item) {
      this.$emit('menu-click', item);
    },
    onClickOutside() {
      this.$emit('menu-click', null);
    }
  },
  computed: {
    getGroupDividerClass() {
      let result = {};
      (this.menuList || []).forEach((item, index) => {
        result[item.groupName] = index;
      });
      return (item, index) => {
        return index === result[item.groupName] ? 'menu-type' : '';
      };
    }
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.theme(@primary-hover-color, @border-color) {
  .right-click-menu-box {
    position: absolute;
    width: 190px;
    max-height: 320px;
    overflow-y: hidden;
    z-index: 1000;
    .menu-li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 16px;
      &.menu-type {
        border-bottom: 1px solid var(--border-color, @border-color);
      }
      &:hover {
        background: var(--primary-hover-color, @primary-hover-color);
        color: @default-op;
      }
    }
  }
}
html {
  .theme(@default-primary-hover-color, @default-border);
  &.theme-dark {
    .theme(@dark-primary-hover-color, @dark-border);
  }
}
</style>
