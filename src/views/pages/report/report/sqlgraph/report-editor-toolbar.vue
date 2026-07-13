<template>
  <div class="action-group pl-nm pr-nm pb-xs pt-xs border-base-bottom">
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
