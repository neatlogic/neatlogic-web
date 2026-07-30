<template>
  <div class="workbench-widget-host">
    <div v-if="isMockEnabled" class="mock-badge text-warning">演示数据</div>
    <div v-if="renderError" class="widget-state bg-op radius-lg flex-center text-center">
      <i class="tsfont-warning-o text-danger"></i>
      <div class="text-grey mt-xs">{{ renderError }}</div>
      <Button
        class="mt-sm"
        size="small"
        ghost
        @click="retryRender"
      >
        重新加载
      </Button>
    </div>
    <div v-else-if="isMockDisabled" class="widget-state bg-op radius-lg flex-center text-center">
      <i class="tsfont-warning-o text-warning"></i>
      <div class="text-grey mt-xs">业务数据接口待接入</div>
    </div>
    <component
      :is="definition.component"
      v-else-if="definition && definition.component && isNearViewport"
      :key="`${widget.i || widget.uuid || widget.type}-${retryKey}`"
      :widget="resolvedWidget"
      :config="resolvedWidget.config || {}"
      :title="resolvedWidget.name || definition.label"
      :description="resolvedWidget.description || ''"
      :showTitle="resolvedWidget.showTitle !== 0"
    ></component>
    <div
      v-else-if="definition && definition.component"
      class="widget-state bg-op radius-lg flex-center"
      aria-label="组件等待加载"
    >
      <Loading :loadingShow="true"></Loading>
    </div>
    <div v-else class="widget-state bg-op radius-lg flex-center text-center">
      <i class="tsfont-warning-o text-warning"></i>
      <div class="text-grey mt-xs">组件不可用，可在编辑页移除</div>
    </div>
  </div>
</template>

<script>
import { createWorkbenchWidgetDefinitionMap, migrateWorkbenchWidget } from '../workbench-provider-registry.js';
import { isWorkbenchMockModeEnabled } from '../workbench-constants.js';

export default {
  name: 'PortalWorkbenchWidgetHost',
  props: {
    widget: { type: Object, default: () => ({}) },
    widgetDefinitions: { type: Array, default: () => [] },
    lazy: { type: Boolean, default: true }
  },
  data() {
    return {
      renderError: '',
      retryKey: 0,
      isNearViewport: !this.lazy || typeof window === 'undefined' || !window.IntersectionObserver,
      intersectionObserver: null
    };
  },
  mounted() {
    this.observeVisibility();
  },
  beforeDestroy() {
    this.disconnectVisibilityObserver();
  },
  errorCaptured(error) {
    this.renderError = (error && error.message) || '组件加载失败';
    return false;
  },
  methods: {
    disconnectVisibilityObserver() {
      if (this.intersectionObserver) {
        this.intersectionObserver.disconnect();
        this.intersectionObserver = null;
      }
    },
    observeVisibility() {
      if (this.isNearViewport || !this.lazy || typeof window === 'undefined' || !window.IntersectionObserver) {
        return;
      }
      this.intersectionObserver = new window.IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          this.isNearViewport = true;
          this.disconnectVisibilityObserver();
        }
      }, {
        rootMargin: '240px 0px'
      });
      this.intersectionObserver.observe(this.$el);
    },
    retryRender() {
      this.renderError = '';
      this.retryKey += 1;
    }
  },
  computed: {
    definitionMap() {
      return createWorkbenchWidgetDefinitionMap(this.widgetDefinitions);
    },
    definition() {
      return this.definitionMap.get(this.widget.type) || null;
    },
    isMockEnabled() {
      return !!(this.definition && this.definition.dataMode === 'mock' && isWorkbenchMockModeEnabled());
    },
    isMockDisabled() {
      return !!(this.definition && this.definition.dataMode === 'mock' && !this.isMockEnabled);
    },
    resolvedWidget() {
      return migrateWorkbenchWidget(this.widget, this.definition) || this.widget;
    }
  },
  watch: {
    'widget.type'() {
      this.renderError = '';
    }
  }
};
</script>

<style lang="less" scoped>
.workbench-widget-host {
  position: relative;
  height: 100%;
  min-width: 0;
  overflow: hidden;
  .mock-badge {
    position: absolute;
    bottom: 8px;
    right: 12px;
    z-index: 6;
    padding: 1px 6px;
    border-radius: 10px;
    background: rgba(255, 153, 0, 0.12);
    font-size: 11px;
    pointer-events: none;
  }
  .widget-state {
    height: 100%;
    min-height: 100px;
    flex-direction: column;
  }
}
</style>
