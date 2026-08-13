<template>
  <div :class="['workbench-widget-host', { 'is-background-transparent': isBackgroundTransparent }]">
    <div v-if="renderError" class="widget-state bg-op radius-lg flex-center text-center">
      <i class="tsfont-warning-o text-danger"></i>
      <div class="text-grey mt-xs">{{ renderError }}</div>
      <Button
        class="mt-sm"
        size="small"
        ghost
        @click="retryRender"
      >
        {{ $t('term.workbench.reload') }}
      </Button>
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
      :aria-label="$t('term.workbench.widgetwaiting')"
      class="widget-state bg-op radius-lg flex-center"
    >
      <Loading :loadingShow="true"></Loading>
    </div>
    <div v-else class="widget-state bg-op radius-lg flex-center text-center">
      <i class="tsfont-warning-o text-warning"></i>
      <div class="text-grey mt-xs">{{ $t('term.workbench.widgetunavailablehint') }}</div>
    </div>
  </div>
</template>

<script>
import { createWorkbenchWidgetDefinitionMap, migrateWorkbenchWidget } from '../workbench-provider-registry.js';

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
    this.renderError = (error && error.message) || this.$t('term.workbench.widgetloadfailed');
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
    resolvedWidget() {
      return migrateWorkbenchWidget(this.widget, this.definition) || this.widget;
    },
    isBackgroundTransparent() {
      return this.resolvedWidget.backgroundTransparent === 1 || this.resolvedWidget.backgroundTransparent === true;
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
  .widget-state {
    height: 100%;
    min-height: 100px;
    flex-direction: column;
  }
  &.is-background-transparent {
    ::v-deep .workbench-card {
      background-color: transparent !important;
    }
  }
}
</style>
