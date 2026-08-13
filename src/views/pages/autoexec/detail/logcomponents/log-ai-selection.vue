<template>
  <div class="log-ai-selection-wrap">
    <div
      v-if="toolbar.isShow && hasLogAiAssistant"
      class="log-selection-toolbar radius-lg"
      :style="{ top: toolbar.top + 'px', left: toolbar.left + 'px' }"
      @mousedown.prevent.stop
    >
      <Tooltip
        :content="aiAssistantDisabledReason"
        :disabled="!aiAssistantDisabledReason"
        transfer
        max-width="320"
      >
        <button
          class="log-selection-action"
          type="button"
          :disabled="!aiAssistantEnabled"
          @click="openLogAiAssistant"
        >
          <span class="log-selection-icon tsfont-ai"></span>
          <span>{{ $t('term.autoexec.askinlogai') }}</span>
        </button>
      </Tooltip>
    </div>
    <component
      :is="autoexecJobLogAiAssistantComponent"
      v-if="hasLogAiAssistant"
      ref="jobLogAiAssistant"
      @availability-change="handleAiAssistantAvailability"
    ></component>
  </div>
</template>
<script>
import ImportComponent from '@/views/components/import-component.js';

export default {
  name: 'LogAiSelection',
  props: {
    logContext: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      toolbar: {
        isShow: false,
        text: '',
        top: 0,
        left: 0
      },
      activeContainer: null,
      aiAssistantEnabled: false,
      aiAssistantDisabledReason: ''
    };
  },
  mounted() {
    if (this.hasLogAiAssistant) {
      document.addEventListener('mousedown', this.handleDocumentMousedown, true);
    }
  },
  beforeDestroy() {
    document.removeEventListener('mousedown', this.handleDocumentMousedown, true);
  },
  methods: {
    handleSelection(container, logContext) {
      // 社区版没有商业日志助手组件时必须彻底静默：保留浏览器文本选中，不显示入口也不触发后续请求。
      if (!this.hasLogAiAssistant) {
        this.hideToolbar();
        return;
      }
      this.$nextTick(() => {
        const selection = window.getSelection && window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
          this.hideToolbar();
          return;
        }
        const selectedText = selection.toString().trim();
        if (!selectedText) {
          this.hideToolbar();
          return;
        }
        const validContainer = container && container.$el ? container.$el : container;
        if (!validContainer || !this.isSelectionInContainer(selection, validContainer)) {
          this.hideToolbar();
          return;
        }
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (!rect || (rect.width === 0 && rect.height === 0)) {
          this.hideToolbar();
          return;
        }
        // 选区组件只捕获当前页面可见日志文本，商业助手可用时才展示提问入口。
        this.activeContainer = validContainer;
        const toolbarWidth = 270;
        this.toolbar = {
          isShow: true,
          text: selectedText,
          top: Math.max(rect.top - 42, 8),
          left: Math.min(Math.max(rect.left + rect.width / 2 - toolbarWidth / 2, 8), window.innerWidth - toolbarWidth - 8),
          logContext: logContext || this.logContext || {}
        };
      });
    },
    hideToolbar() {
      if (this.toolbar.isShow) {
        this.toolbar = {
          isShow: false,
          text: '',
          top: 0,
          left: 0
        };
      }
      this.activeContainer = null;
    },
    openLogAiAssistant() {
      if (!this.aiAssistantEnabled) {
        return;
      }
      const assistant = this.$refs.jobLogAiAssistant;
      if (!assistant || !assistant.openDialog) {
        this.hideToolbar();
        return;
      }
      assistant.openDialog({
        selectedLog: this.toolbar.text,
        logContext: this.toolbar.logContext || this.logContext || {},
        question: this.$t('term.autoexec.defaultlogaiquestion')
      });
      this.hideToolbar();
      if (window.getSelection) {
        window.getSelection().removeAllRanges();
      }
    },
    handleAiAssistantAvailability({ enabled, disabledReason }) {
      this.aiAssistantEnabled = enabled;
      this.aiAssistantDisabledReason = disabledReason || '';
    },
    isSelectionInContainer(selection, container) {
      const anchorNode = selection.anchorNode;
      const focusNode = selection.focusNode;
      return anchorNode && focusNode && container.contains(anchorNode) && container.contains(focusNode);
    },
    handleDocumentMousedown(event) {
      const toolbar = this.$el && this.$el.querySelector('.log-selection-toolbar');
      if ((toolbar && toolbar.contains(event.target)) || (this.activeContainer && this.activeContainer.contains(event.target))) {
        return;
      }
      this.hideToolbar();
    }
  },
  computed: {
    hasLogAiAssistant() {
      return !!this.autoexecJobLogAiAssistantComponent;
    },
    autoexecJobLogAiAssistantComponent() {
      return ImportComponent.autoexecJobLogAiAssistant || null;
    }
  }
};
</script>
<style lang="less">
html.theme-dark {
  .log-selection-toolbar {
    color: #ffffff;
    background: #1f2329;
    border-color: rgba(255, 255, 255, 0.16);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.34), 0 0 0 1px rgba(45, 118, 255, 0.22);
    &::after {
      background: #1f2329;
      border-color: rgba(255, 255, 255, 0.16);
    }
    .log-selection-action {
      color: #ffffff;
      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }
}
</style>
<style lang="less" scoped>
.log-ai-selection-wrap {
  display: contents;
}
.log-selection-toolbar {
  position: fixed;
  z-index: 100000;
  padding: 5px;
  color: #1f2329;
  background: #ffffff;
  border: 1px solid rgba(45, 118, 255, 0.18);
  box-shadow: 0 12px 32px rgba(31, 35, 41, 0.16), 0 0 0 1px rgba(45, 118, 255, 0.12);
  &::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: -7px;
    width: 12px;
    height: 12px;
    background: #ffffff;
    border-right: 1px solid rgba(45, 118, 255, 0.18);
    border-bottom: 1px solid rgba(45, 118, 255, 0.18);
    transform: translateX(-50%) rotate(45deg);
  }
  .log-selection-action {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    height: 34px;
    padding: 0 14px;
    color: #1f2329;
    background: transparent;
    border: 0;
    border-radius: 14px;
    line-height: 20px;
    white-space: nowrap;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    &:hover {
      background: rgba(45, 118, 255, 0.08);
    }
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      &:hover {
        background: transparent;
      }
    }
  }
  .log-selection-icon {
    width: 20px;
    height: 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    background: #2d76ff;
    border-radius: 50%;
    font-size: 13px;
  }
}
</style>
