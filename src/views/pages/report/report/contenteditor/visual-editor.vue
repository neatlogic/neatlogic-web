<template>
  <div class="visual-content-editor">
    <div v-if="!content" class="empty-tip text-grey">
      {{ $t('term.report.emptycontentvisualtip') }}
    </div>
    <div
      v-else
      class="visual-canvas"
      @click="handleCanvasClick"
      v-html="renderedContent"
    ></div>
  </div>
</template>
<script>
import { renderVisualContent } from './content-renderer';

export default {
  name: 'VisualContentEditor',
  props: {
    content: { type: String, default: '' },
    tokenList: { type: Array, default: () => [] },
    ruleMap: { type: Object, default: () => ({}) },
    selectedTokenId: { type: String }
  },
  methods: {
    handleCanvasClick(event) {
      const actionTarget = event.target.closest('[data-token-action]');
      if (actionTarget) {
        event.preventDefault();
        event.stopPropagation();
        this.$emit('move-token', {
          tokenId: actionTarget.getAttribute('data-token-id'),
          direction: actionTarget.getAttribute('data-token-action')
        });
        return;
      }
      const widgetTarget = event.target.closest('[data-token-id]');
      if (widgetTarget) {
        event.preventDefault();
        event.stopPropagation();
        this.$emit('select-token', widgetTarget.getAttribute('data-token-id'));
      }
    }
  },
  computed: {
    renderedContent() {
      return renderVisualContent(this.content, this.tokenList, this.ruleMap, this.selectedTokenId);
    }
  }
};
</script>
<style lang="less" scoped>
.visual-content-editor {
  height: 100%;
  overflow: auto;
  background: var(--body-bg);
  .empty-tip {
    padding: 16px;
  }
  .visual-canvas {
    min-height: 100%;
    padding: 16px;
    color: var(--text-color);
    background: var(--blockbg);
  }
  ::v-deep .report-template-directive {
    display: inline-block;
    margin: 2px;
    padding: 2px 6px;
    border: 1px dashed var(--border-color);
    border-radius: 4px;
    color: var(--text-grey);
    background: var(--blockbg);
    font-family: monospace;
  }
  ::v-deep .report-widget-placeholder {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    min-width: 220px;
    max-width: 100%;
    margin: 6px 4px;
    padding: 8px 10px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    color: var(--text-color);
    background: var(--blockbg);
    cursor: pointer;
    vertical-align: middle;
    user-select: none;
  }
  ::v-deep .report-widget-placeholder.is-selected {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(45, 140, 240, 0.15);
  }
  ::v-deep .report-widget-placeholder.is-invalid {
    border-style: dashed;
  }
  ::v-deep .report-widget-main {
    display: inline-flex;
    align-items: flex-start;
    min-width: 0;
  }
  ::v-deep .report-widget-icon {
    margin-right: 8px;
    line-height: 20px;
  }
  ::v-deep .report-widget-text {
    display: inline-flex;
    flex-direction: column;
    min-width: 0;
  }
  ::v-deep .report-widget-title {
    color: var(--text-color);
    font-weight: bold;
    line-height: 20px;
  }
  ::v-deep .report-widget-summary,
  ::v-deep .report-widget-warning {
    max-width: 360px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text-grey);
    line-height: 18px;
  }
  ::v-deep .report-widget-warning {
    color: var(--error-color);
  }
  ::v-deep .report-widget-actions {
    display: inline-flex;
    gap: 4px;
    margin-left: 10px;
  }
  ::v-deep .report-widget-actions button {
    height: 24px;
    padding: 0 6px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    color: var(--text-color);
    background: var(--blockbg);
    cursor: pointer;
  }
  ::v-deep .report-widget-actions button:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
    background: var(--body-bg);
  }
}
</style>
