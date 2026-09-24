<template>
  <div ref="actionBar" class="action-group ts-action-bar">
    <span
      v-for="action in visibleActionList"
      :key="action.key"
      class="action-item ts-action-bar-item"
      :class="[action.icon, { disable: action.disabled }]"
      @click="handleAction(action)"
    >{{ action.text }}</span>
    <span v-if="overflowActionList.length" class="action-item ts-action-bar-more">
      <Dropdown
        :placement="placement"
        :transfer="transfer"
        trigger="click"
        @on-click="handleOverflowAction"
      >
        <Tooltip :content="$t('page.more')" :transfer="transfer">
          <span class="tsfont-option-horizontal"></span>
        </Tooltip>
        <DropdownMenu slot="list">
          <DropdownItem
            v-for="action in overflowActionList"
            :key="action.key"
            :name="action.key"
            :disabled="action.disabled"
          >
            <span :class="action.icon">{{ action.text }}</span>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </span>
    <span v-if="hasFixed" ref="fixed" class="action-group ts-action-bar-fixed">
      <slot name="fixed"></slot>
    </span>
    <div ref="measure" class="ts-action-bar-measure" aria-hidden="true">
      <span
        v-for="action in availableActionList"
        :key="action.key"
        ref="measureAction"
        class="action-item ts-action-bar-measure-item"
        :class="action.icon"
      >{{ action.text }}</span>
      <span ref="measureMore" class="action-item ts-action-bar-measure-item tsfont-option-horizontal"></span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TsActionBar',
  props: {
    actionList: {
      type: Array,
      default() {
        return [];
      }
    },
    placement: {
      type: String,
      default: 'bottom-end'
    },
    transfer: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      visibleCount: 0,
      resizeObserver: null,
      updatePending: false
    };
  },
  mounted() {
    this.initResizeObserver();
    this.scheduleLayout();
  },
  beforeDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    } else {
      window.removeEventListener('resize', this.scheduleLayout);
    }
  },
  methods: {
    initResizeObserver() {
      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(this.scheduleLayout);
        this.resizeObserver.observe(this.$refs.actionBar);
        if (this.$refs.fixed) {
          this.resizeObserver.observe(this.$refs.fixed);
        }
      } else {
        window.addEventListener('resize', this.scheduleLayout);
      }
    },
    scheduleLayout() {
      if (this.updatePending) {
        return;
      }
      this.updatePending = true;
      this.$nextTick(() => {
        this.updatePending = false;
        this.updateLayout();
      });
    },
    updateLayout() {
      const actionBar = this.$refs.actionBar;
      const actionElements = this.$refs.measureAction || [];
      const moreElement = this.$refs.measureMore;
      if (!actionBar || !moreElement) {
        return;
      }
      const actionWidthList = actionElements.map(element => element.getBoundingClientRect().width);
      const moreWidth = moreElement.getBoundingClientRect().width;
      const fixedWidth = this.$refs.fixed ? this.$refs.fixed.getBoundingClientRect().width : 0;
      const availableWidth = actionBar.clientWidth;
      const actionCount = actionWidthList.length;
      const actionTotalWidthList = [0];
      let visibleCount = actionCount;
      actionWidthList.forEach(width => {
        actionTotalWidthList.push(actionTotalWidthList[actionTotalWidthList.length - 1] + width);
      });

      if (this.getRequiredWidth(actionTotalWidthList[actionCount], actionCount, fixedWidth) > availableWidth) {
        visibleCount = 0;
        for (let index = 0; index <= actionCount; index++) {
          const requiredWidth = this.getRequiredWidth(actionTotalWidthList[index] + moreWidth, index + 1, fixedWidth);
          if (requiredWidth <= availableWidth) {
            visibleCount = index;
          } else {
            break;
          }
        }
      }
      if (this.visibleCount !== visibleCount) {
        this.visibleCount = visibleCount;
      }
    },
    getRequiredWidth(contentWidth, flexibleItemCount, fixedWidth) {
      if (this.hasFixed) {
        const flexiblePadding = flexibleItemCount > 0 ? 8 + Math.max(flexibleItemCount - 1, 0) * 16 : 0;
        return contentWidth + flexiblePadding + fixedWidth;
      }
      if (flexibleItemCount === 1) {
        return contentWidth + 8;
      }
      return contentWidth + Math.max(flexibleItemCount - 1, 0) * 16;
    },
    hasAuth(auth) {
      if (!auth) {
        return true;
      }
      const authList = Array.isArray(auth) ? auth : [auth];
      return authList.some(item => this.$AuthUtils.hasRole(item));
    },
    handleAction(action) {
      if (!action.disabled) {
        this.$emit('click', action);
      }
    },
    handleOverflowAction(key) {
      const action = this.overflowActionList.find(item => item.key === key);
      action && this.handleAction(action);
    }
  },
  computed: {
    availableActionList() {
      return this.actionList.filter(action => {
        return action && action.visible !== false && this.hasAuth(action.auth);
      });
    },
    visibleActionList() {
      return this.availableActionList.slice(0, this.visibleCount);
    },
    overflowActionList() {
      return this.availableActionList.slice(this.visibleCount);
    },
    hasFixed() {
      return !!this.$slots.fixed;
    }
  },
  watch: {
    availableActionList: {
      handler() {
        this.scheduleLayout();
      },
      deep: true
    }
  }
};
</script>

<style lang="less" scoped>
.ts-action-bar {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  .ts-action-bar-item,
  .ts-action-bar-more {
    flex: none;
  }
  .ts-action-bar-item.disable {
    opacity: 0.5;
  }
  .ts-action-bar-more {
    line-height: normal;
  }
  .ts-action-bar-fixed {
    display: inline-flex;
    flex: none;
    align-items: center;
  }
  .ts-action-bar-measure {
    position: absolute;
    left: 0;
    top: 0;
    display: flex;
    width: max-content;
    height: 0;
    overflow: hidden;
    visibility: hidden;
    pointer-events: none;
  }
  .ts-action-bar-measure-item {
    flex: none;
    padding: 0 !important;
  }
  .ts-action-bar-measure-item.tsfont-option-horizontal:before {
    margin-right: 0;
  }
}
</style>
