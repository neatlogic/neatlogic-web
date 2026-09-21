<template>
  <Tooltip
    ref="tooltip"
    class="overflow-tooltip"
    v-bind="$attrs"
    :content="tooltipContent"
    :disabled="disabled || !tooltipContent || !isOverflow"
    :placement="placement"
    :transfer="transfer"
    v-on="$listeners"
  >
    <slot></slot>
  </Tooltip>
</template>

<script>
const resizeCallbackMap = new Map();
let resizeObserver = null;
let isWindowResizeListening = false;

function handleWindowResize() {
  resizeCallbackMap.forEach(callback => callback());
}

function observeElement(element, callback) {
  resizeCallbackMap.set(element, callback);
  if (typeof ResizeObserver !== 'undefined') {
    if (!resizeObserver) {
      resizeObserver = new ResizeObserver(entryList => {
        entryList.forEach(entry => {
          const resizeCallback = resizeCallbackMap.get(entry.target);
          resizeCallback && resizeCallback();
        });
      });
    }
    resizeObserver.observe(element);
  } else if (!isWindowResizeListening) {
    window.addEventListener('resize', handleWindowResize);
    isWindowResizeListening = true;
  }
}

function unobserveElement(element) {
  if (!element) {
    return;
  }
  resizeCallbackMap.delete(element);
  resizeObserver && resizeObserver.unobserve(element);
  if (isWindowResizeListening && resizeCallbackMap.size === 0) {
    window.removeEventListener('resize', handleWindowResize);
    isWindowResizeListening = false;
  }
}

export default {
  name: 'OverflowTooltip',
  inheritAttrs: false,
  props: {
    content: {
      type: [String, Number],
      default: ''
    },
    placement: {
      type: String,
      default: 'top'
    },
    transfer: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isOverflow: false,
      targetElement: null,
      updatePending: false
    };
  },
  mounted() {
    this.bindTargetElement();
  },
  updated() {
    this.bindTargetElement();
  },
  beforeDestroy() {
    unobserveElement(this.targetElement);
    this.targetElement = null;
  },
  methods: {
    getTargetElement() {
      const tooltipElement = this.$refs.tooltip && this.$refs.tooltip.$el;
      if (!tooltipElement) {
        return null;
      }
      return tooltipElement.querySelector('[data-overflow-tooltip-target]') ||
        tooltipElement.querySelector('.overflow .overflow') ||
        tooltipElement.querySelector('.overflow') ||
        tooltipElement.querySelector('.ivu-tooltip-rel > *') ||
        tooltipElement.querySelector('.ivu-tooltip-rel');
    },
    bindTargetElement() {
      const targetElement = this.getTargetElement();
      if (targetElement !== this.targetElement) {
        unobserveElement(this.targetElement);
        this.targetElement = targetElement;
        targetElement && observeElement(targetElement, this.updateOverflow);
      }
      this.updateOverflow();
    },
    updateOverflow() {
      if (this.updatePending) {
        return;
      }
      this.updatePending = true;
      this.$nextTick(() => {
        this.updatePending = false;
        const element = this.targetElement;
        const isOverflow = !!element && element.scrollWidth > element.clientWidth;
        if (this.isOverflow !== isOverflow) {
          this.isOverflow = isOverflow;
        }
      });
    }
  },
  computed: {
    tooltipContent() {
      return String(this.content == null ? '' : this.content);
    }
  }
};
</script>

<style lang="less" scoped>
.overflow-tooltip {
  display: block;
  min-width: 0;
  max-width: 100%;
  ::v-deep .ivu-tooltip-rel {
    display: block;
    width: 100%;
    min-width: 0;
  }
}
</style>
