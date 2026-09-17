<template>
  <div
    class="ts-resize-handle"
    :class="`is-${direction}`"
    aria-hidden="true"
  >
    <span class="ts-resize-handle-line"></span>
    <span class="ts-resize-handle-grip">
      <i v-for="index in 5" :key="index"></i>
    </span>
  </div>
</template>
<script>
export default {
  name: 'TsResizeHandle',
  props: {
    direction: {
      type: String,
      default: 'vertical',
      validator: value => ['vertical', 'horizontal'].includes(value)
    }
  }
};
</script>
<style lang="less" scoped>
.ts-resize-handle {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  touch-action: none;

  .ts-resize-handle-line {
    position: absolute;
    opacity: 0;
    background-color: var(--dividing-color, #e8eaec);
    transition: opacity 0.2s ease, background-color 0.2s ease;
  }

  .ts-resize-handle-grip {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2px;
    box-sizing: border-box;
    opacity: 0;
    background: #f3f3f3;
    box-shadow: 0 0 1px 1px rgba(0, 0, 0, 0.2);
    transition: opacity 0.2s ease, box-shadow 0.2s ease;

    i {
      display: block;
      flex: none;
      background: silver;
    }
  }

  &:hover,
  &:active {
    .ts-resize-handle-line {
      opacity: 1;
      background-color: var(--primary-color, #1677ff);
    }

    .ts-resize-handle-grip {
      opacity: 1;
      box-shadow: 0 0 0 1px var(--primary-color, #1677ff), 0 0 1px 1px rgba(0, 0, 0, 0.2);
    }
  }

  &.is-vertical {
    cursor: col-resize;

    .ts-resize-handle-line {
      top: 0;
      bottom: 0;
      left: 50%;
      width: 1px;
      transform: translateX(-50%);
    }

    .ts-resize-handle-grip {
      width: 8px;
      height: 100px;
      flex-direction: column;
      border-radius: 4px / 6px;

      i {
        width: 4px;
        height: 1px;
      }
    }
  }

  &.is-horizontal {
    cursor: row-resize;

    .ts-resize-handle-line {
      top: 50%;
      right: 0;
      left: 0;
      height: 1px;
      transform: translateY(-50%);
    }

    .ts-resize-handle-grip {
      width: 100px;
      height: 8px;
      flex-direction: row;
      border-radius: 6px / 4px;

      i {
        width: 1px;
        height: 4px;
      }
    }
  }
}
</style>
