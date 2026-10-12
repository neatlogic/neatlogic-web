<template>
  <div class="report-editor-toolbar flex-between pl-nm pr-nm pb-xs pt-xs">
    <div class="action-group">
      <span
        class="action-item tsfont-undo toolbar-icon-font-size"
        :class="{ disable: !canUndo }"
        :title="$t('term.report.undoaction')"
        @click="canUndo && $emit('undo')"
      ></span>
      <span
        class="action-item tsfont-revover toolbar-icon-font-size"
        :class="{ disable: !canRedo }"
        :title="$t('term.report.redoaction')"
        @click="canRedo && $emit('redo')"
      ></span>
      <span class="action-item"><Divider type="vertical"></Divider></span>
      <span class="action-item tsfont-search-plus toolbar-icon-font-size" :title="$t('term.report.zoomin')" @click="$emit('zoom', 0.1)"></span>
      <span class="action-item tsfont-search-minus toolbar-icon-font-size" :title="$t('term.report.zoomout')" @click="$emit('zoom', -0.1)"></span>
      <span class="action-item tsfont-search toolbar-icon-font-size" :title="$t('term.report.resetview')" @click="$emit('zoom-reset')"></span>
      <span class="action-item tsfont-center toolbar-icon-font-size" :title="$t('term.report.fitcanvas')" @click="$emit('zoom-fit')"></span>
      <span
        class="action-item toolbar-icon-font-size"
        :class="isFullscreen ? 'tsfont-off-fullscreen' : 'tsfont-fullscreen'"
        :title="isFullscreen ? $t('term.report.exitfullscreen') : $t('page.fullscreen')"
        @click="$emit('fullscreen')"
      ></span>
      <template v-if="selectedCell">
        <span class="action-item"><Divider type="vertical"></Divider></span>
        <span class="action-item tsfont-trash-o toolbar-icon-font-size" :title="$t('page.delete')" @click="$emit('delete')"></span>
      </template>
    </div>
    <slot name="right"></slot>
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
.report-editor-toolbar {
  flex-shrink: 0;
  min-width: 0;
  > * {
    flex-shrink: 0;
  }
  // 仅左侧图标组占用剩余空间，避免右侧模式切换组同时拉伸而停在中间。
  > .action-group:first-child {
    flex: 1;
    min-width: 0;
    overflow-x: auto;
    white-space: nowrap;
  }
}
.toolbar-icon-font-size {
  font-size: 16px;
}
</style>
