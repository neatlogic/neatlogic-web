<template>
  <div class="workbench-widget radius-lg" :class="{ selected: selected, 'border-color-primary': selected }">
    <span
      v-if="editable"
      class="widget-remove tsfont-close radius-sm flex-center cursor-pointer bg-error-grey text-danger"
      title="删除组件"
      @mousedown.stop.prevent
      @click.stop.prevent="$emit('remove', widget)"
    ></span>
    <div class="widget-body" :style="bodyStyle">
      <slot name="widget" :widget="widget" :mode="editable ? 'edit' : 'read'"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PortalWorkbenchGridItem',
  props: {
    widget: { type: Object, default: () => ({}) },
    editable: { type: Boolean, default: false },
    selected: { type: Boolean, default: false }
  },
  computed: {
    bodyStyle() {
      const padding = (this.widget && this.widget.padding) || 0;
      return {
        padding: padding + 'px'
      };
    }
  }
};
</script>

<style lang="less" scoped>
.workbench-widget {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border: 1px solid transparent;
  background: transparent;
  color: inherit;
  .widget-remove {
    position: absolute;
    top: 4px;
    right: 8px;
    z-index: 8;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.16s ease, color 0.16s ease, background 0.16s ease;
  }
  &:hover,
  &.selected {
    .widget-remove {
      opacity: 1;
      pointer-events: auto;
    }
  }
  .widget-body {
    position: absolute;
    inset: 0;
    overflow: hidden;
    box-sizing: border-box;
  }
}
</style>
