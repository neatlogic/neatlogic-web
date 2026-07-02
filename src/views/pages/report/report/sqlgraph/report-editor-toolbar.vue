<template>
  <div class="action-group pl-nm pr-nm pb-xs pt-xs border-base-bottom">
    <span
      class="action-item tsfont-undo toolbar-icon-font-size"
      :class="{ disable: !canUndo }"
      title="撤销 (Ctrl/Cmd + Z)"
      @click="canUndo && $emit('undo')"
    ></span>
    <span
      class="action-item tsfont-revover toolbar-icon-font-size"
      :class="{ disable: !canRedo }"
      title="重做 (Ctrl/Cmd + Y)"
      @click="canRedo && $emit('redo')"
    ></span>
    <span class="action-item"><Divider type="vertical"></Divider></span>
    <span class="action-item tsfont-search-plus toolbar-icon-font-size" title="放大" @click="$emit('zoom', 0.1)"></span>
    <span class="action-item tsfont-search-minus toolbar-icon-font-size" title="缩小" @click="$emit('zoom', -0.1)"></span>
    <span class="action-item tsfont-search toolbar-icon-font-size" title="重置视图" @click="$emit('zoom-reset')"></span>
    <span class="action-item tsfont-center toolbar-icon-font-size" title="适配画布" @click="$emit('zoom-fit')"></span>
    <span
      class="action-item toolbar-icon-font-size"
      :class="isFullscreen ? 'tsfont-off-fullscreen' : 'tsfont-fullscreen'"
      :title="isFullscreen ? '退出全屏' : '全屏'"
      @click="$emit('fullscreen')"
    ></span>
    <template v-if="selectedCell">
      <span class="action-item"><Divider type="vertical"></Divider></span>
      <span class="action-item tsfont-trash-o toolbar-icon-font-size" title="删除" @click="$emit('delete')"></span>
    </template>
  </div>
</template>
<script>
export default {
  name: 'ReportEditorToolbar',
  props: {
    canUndo: Boolean,
    canRedo: Boolean,
    selectedCell: Object,
    isFullscreen: Boolean
  }
};
</script>
<style lang="less" scoped>
.toolbar-icon-font-size {
  font-size: 16px;
}
</style>
