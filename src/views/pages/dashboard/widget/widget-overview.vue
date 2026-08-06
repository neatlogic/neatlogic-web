<!--仪表板 AntV Mix 单画布缩略预览-->
<template>
  <div ref="overview" class="widget-container">
    <div
      v-if="widgetList && widgetList.length > 0"
      class="widget-content"
    >
      <canvas
        v-if="isVisible"
        ref="snapshot"
        class="widget-mix-snapshot"
        role="img"
        :aria-label="$t('term.dashboard.dashboard')"
      ></canvas>
      <div
        v-if="isVisible"
        ref="stage"
        class="widget-mix-render-stage"
        :style="stageStyle"
        aria-hidden="true"
      ></div>
      <div v-if="isVisible && hasRenderError" class="widget-mix-error text-grey">
        {{ $t('term.dashboard.unsupportedpreview') }}
      </div>
      <div
        v-if="isVisible && layout.hasOverflow"
        class="widget-overflow-hint"
        :style="overflowHintStyle"
        aria-hidden="true"
      >
        <span class="tsfont-down"></span>
      </div>
    </div>
    <table v-else class="empty-tips">
      <tbody>
        <tr>
          <td>{{ $t('page.nodata') }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { Mix } from '@antv/g2plot';
import ThemeUtils from '@/views/pages/framework/theme/themeUtils.js';
import { buildDashboardMixOptions, getDashboardMixLayout } from './widget-mix-preview.js';

const PREVIEW_CACHE_LIMIT = 12;
// 预览绘制结果发生变化时必须提升版本，避免继续复用旧的静态快照。
const PREVIEW_CACHE_VERSION = 16;
const PREVIEW_AFTER_RENDER_DELAY = 120;
const PREVIEW_RENDER_SETTLE_DELAY = 500;
const PREVIEW_CAPTURE_FALLBACK_DELAY = 1200;
// 跨组件共享少量高 DPI Canvas，离开页面后仍可快速复用最近的预览。
const previewCache = new Map();

function getPreviewCacheKey(widgetList, theme, width, height) {
  try {
    return JSON.stringify({ version: PREVIEW_CACHE_VERSION, widgetList, theme, width, height });
  } catch (error) {
    return null;
  }
}

function getCachedPreview(key) {
  if (!key || !previewCache.has(key)) {
    return null;
  }
  const cached = previewCache.get(key);
  previewCache.delete(key);
  previewCache.set(key, cached);
  return cached;
}

function cachePreview(key, sourceCanvas) {
  if (!key || !sourceCanvas) {
    return null;
  }
  const canvas = document.createElement('canvas');
  canvas.width = sourceCanvas.width;
  canvas.height = sourceCanvas.height;
  const context = canvas.getContext('2d');
  if (!context) {
    return null;
  }
  context.drawImage(sourceCanvas, 0, 0);
  if (previewCache.has(key)) {
    previewCache.delete(key);
  }
  previewCache.set(key, canvas);
  while (previewCache.size > PREVIEW_CACHE_LIMIT) {
    const oldestKey = previewCache.keys().next().value;
    const oldestCanvas = previewCache.get(oldestKey);
    previewCache.delete(oldestKey);
    if (oldestCanvas) {
      oldestCanvas.width = 0;
      oldestCanvas.height = 0;
    }
  }
  return canvas;
}

export default {
  name: 'WidgetOverview',
  props: {
    widgetList: { type: Array, default: () => [] }
  },
  data() {
    return {
      isVisible: false,
      mixPlot: null,
      observer: null,
      resizeObserver: null,
      rebuildFrame: null,
      snapshotTimer: null,
      stageWidth: 0,
      stageHeight: 0,
      hasRenderError: false
    };
  },
  mounted() {
    this.observeVisibility();
    this.observeResize();
    this.updateStageSize();
  },
  beforeDestroy() {
    this.cancelRebuild();
    this.destroyPlot();
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    } else {
      window.removeEventListener('resize', this.updateStageSize);
    }
  },
  methods: {
    observeVisibility() {
      if (typeof IntersectionObserver === 'undefined') {
        this.setVisible(true);
        return;
      }
      this.observer = new IntersectionObserver(
        entries => {
          const entry = entries && entries[0];
          this.setVisible(!!(entry && entry.isIntersecting));
        },
        { rootMargin: '160px 0px', threshold: 0 }
      );
      this.observer.observe(this.$refs.overview);
    },
    observeResize() {
      if (typeof ResizeObserver === 'undefined') {
        window.addEventListener('resize', this.updateStageSize);
        return;
      }
      this.resizeObserver = new ResizeObserver(() => this.updateStageSize());
      this.resizeObserver.observe(this.$refs.overview);
    },
    setVisible(isVisible) {
      if (this.isVisible === isVisible) {
        return;
      }
      this.isVisible = isVisible;
      if (isVisible) {
        this.$nextTick(() => {
          this.updateStageSize();
          this.queueRebuild();
        });
      } else {
        this.cancelRebuild();
        this.destroyPlot();
      }
    },
    updateStageSize() {
      const container = this.$refs.overview;
      if (!container) {
        return;
      }
      const availableWidth = container.clientWidth;
      const availableHeight = container.clientHeight;
      if (!availableWidth || !availableHeight) {
        return;
      }
      const width = Math.max(Math.floor(availableWidth), 1);
      const height = Math.max(Math.floor(availableHeight), 1);
      if (width === this.stageWidth && height === this.stageHeight) {
        return;
      }
      this.stageWidth = width;
      this.stageHeight = height;
      if (this.isVisible) {
        this.$nextTick(() => this.queueRebuild());
      }
    },
    queueRebuild() {
      if (!this.isVisible || !this.widgetList.length) {
        return;
      }
      this.cancelRebuild();
      const requestFrame = window.requestAnimationFrame || (callback => window.setTimeout(callback, 16));
      this.rebuildFrame = requestFrame(() => {
        this.rebuildFrame = null;
        this.$nextTick(() => {
          this.updateStageSize();
          this.renderPlot();
        });
      });
    },
    cancelRebuild() {
      if (this.rebuildFrame == null) {
        return;
      }
      const cancelFrame = window.cancelAnimationFrame || window.clearTimeout;
      cancelFrame(this.rebuildFrame);
      this.rebuildFrame = null;
    },
    renderPlot() {
      const stage = this.$refs.stage;
      const snapshot = this.$refs.snapshot;
      if (!stage || !snapshot || !this.stageWidth || !this.stageHeight || !this.widgetList.length) {
        return;
      }
      this.destroyPlot();
      const theme = this.getPreviewTheme();
      const cacheKey = getPreviewCacheKey(this.widgetList, theme, this.stageWidth, this.stageHeight);
      const cachedCanvas = getCachedPreview(cacheKey);
      if (cachedCanvas) {
        this.drawSnapshot(cachedCanvas);
        this.hasRenderError = false;
        return;
      }
      const options = buildDashboardMixOptions(
        this.layout,
        { width: this.stageWidth, height: this.stageHeight },
        theme,
        this.getPreviewLabels()
      );
      this.hasRenderError = false;
      try {
        // Mix 仅用于生成快照；快照完成后实例和临时 Canvas 会立即销毁。
        this.mixPlot = new Mix(stage, options);
        const renderReadyAt = Date.now() + PREVIEW_RENDER_SETTLE_DELAY;
        const afterRenderHandler = () => {
          // 后续 View 的 afterrender 会重置计时，合并为一次稳定快照。
          this.queueSnapshot(cacheKey, Math.max(PREVIEW_AFTER_RENDER_DELAY, renderReadyAt - Date.now()));
        };
        this.mixPlot.on('afterrender', afterRenderHandler);
        this.mixPlot.render();
        if (this.snapshotTimer == null) {
          this.queueSnapshot(cacheKey, PREVIEW_CAPTURE_FALLBACK_DELAY);
        }
      } catch (error) {
        this.destroyPlot();
        this.hasRenderError = true;
      }
    },
    queueSnapshot(cacheKey, delay) {
      this.cancelSnapshot();
      this.snapshotTimer = window.setTimeout(() => {
        this.snapshotTimer = null;
        const stage = this.$refs.stage;
        const sourceCanvas = stage && stage.querySelector('canvas');
        if (!sourceCanvas) {
          this.destroyPlot();
          this.hasRenderError = true;
          return;
        }
        const cachedSnapshot = cachePreview(cacheKey, sourceCanvas);
        this.drawSnapshot(cachedSnapshot || sourceCanvas);
        this.destroyPlot();
      }, delay);
    },
    cancelSnapshot() {
      if (this.snapshotTimer == null) {
        return;
      }
      window.clearTimeout(this.snapshotTimer);
      this.snapshotTimer = null;
    },
    drawSnapshot(sourceCanvas) {
      const snapshot = this.$refs.snapshot;
      if (!snapshot || !sourceCanvas) {
        return;
      }
      snapshot.width = sourceCanvas.width;
      snapshot.height = sourceCanvas.height;
      const context = snapshot.getContext('2d');
      if (!context) {
        return;
      }
      context.clearRect(0, 0, snapshot.width, snapshot.height);
      context.drawImage(sourceCanvas, 0, 0);
    },
    destroyPlot() {
      this.cancelSnapshot();
      if (this.mixPlot) {
        this.mixPlot.destroy();
        this.mixPlot = null;
      }
      const stage = this.$refs.stage;
      if (stage && stage.firstChild) {
        stage.innerHTML = '';
      }
    },
    getDashboardThemeValue(param) {
      const item = ThemeUtils.getValueListByType('dashboard').find(theme => theme.param === param);
      return item ? item.value : null;
    },
    getPreviewTheme() {
      const isDark = this.systemThemeType === 'dark' || localStorage.themeClass === 'theme-dark';
      const rootStyle = typeof window === 'undefined' ? null : window.getComputedStyle(document.documentElement);
      const tableHeaderColor = rootStyle?.getPropertyValue('--th-bg-color').trim();
      const chartColors = this.getDashboardThemeValue('chart');
      const palette = Array.isArray(chartColors) && chartColors.length
        ? chartColors
        : ['#2f8fff', '#73c0de', '#91cc75', '#fac858', '#ee6666', '#9a60b4'];
      return {
        palette,
        accentColor: palette[1] || palette[0],
        textColor: this.getDashboardThemeValue('chart-data-label-text') || (isDark ? '#ffffff' : '#121212'),
        mutedTextColor: this.getDashboardThemeValue('chart-field-text') || (isDark ? '#b8b8b8' : '#8c8c8c'),
        borderColor: isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.14)',
        gridColor: isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.2)',
        panelColor: isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.96)',
        tableHeaderColor: tableHeaderColor || (isDark ? '#2f323e' : '#eff0f3')
      };
    },
    getPreviewLabels() {
      return {
        data: this.$t('page.data'),
        column: this.$t('page.col'),
        custom: this.$t('page.custom'),
        unsupported: this.$t('term.dashboard.unsupportedpreview'),
        currentTime: new Date().toLocaleString()
      };
    }
  },
  computed: {
    layout() {
      return getDashboardMixLayout(this.widgetList);
    },
    stageStyle() {
      return {
        width: `${this.stageWidth}px`,
        height: `${this.stageHeight}px`
      };
    },
    overflowHintStyle() {
      const theme = this.getPreviewTheme();
      const isDark = this.systemThemeType === 'dark' || localStorage.themeClass === 'theme-dark';
      return {
        '--preview-overflow-color': isDark ? 'rgba(38, 40, 49, 0.96)' : 'rgba(255, 255, 255, 0.96)',
        '--preview-overflow-icon-color': theme.mutedTextColor
      };
    },
    systemThemeType() {
      return this.$store && this.$store.getters.themeType;
    }
  },
  watch: {
    widgetList: {
      handler() {
        this.queueRebuild();
      },
      deep: true
    },
    systemThemeType() {
      this.queueRebuild();
    }
  }
};
</script>

<style lang="less" scoped>
.widget-container {
  width: 100%;
  height: 100%;
  overflow: hidden;

  .empty-tips {
    width: 100%;
    height: 100%;
    vertical-align: middle;
    text-align: center;
  }

  .widget-content {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .widget-mix-snapshot {
    display: block;
    width: 100%;
    height: 100%;
  }

  .widget-mix-render-stage {
    position: absolute;
    top: 0;
    left: 0;
    overflow: hidden;
    opacity: 0;
    pointer-events: none;
  }

  .widget-mix-error {
    position: absolute;
    top: 50%;
    left: 50%;
    font-size: 12px;
    transform: translate(-50%, -50%);
  }

  .widget-overflow-hint {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 2;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    height: 30px;
    padding-bottom: 2px;
    color: var(--preview-overflow-icon-color);
    background: linear-gradient(to bottom, transparent, var(--preview-overflow-color) 82%);
    box-sizing: border-box;
    pointer-events: none;

    .tsfont-down {
      font-size: 10px;
      line-height: 14px;
      opacity: 0.72;
    }
  }
}
</style>
