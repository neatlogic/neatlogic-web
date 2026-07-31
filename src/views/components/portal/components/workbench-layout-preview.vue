<template>
  <div
    ref="previewRoot"
    :class="['workbench-layout-preview', `is-${mode}`]"
  >
    <div
      ref="previewDemo"
      class="preview-demo"
      aria-hidden="true"
      inert
    >
      <div v-if="!isReady" class="preview-state flex-center text-grey">
        <span class="tsfont-m-dashboard mr-xs"></span>
        布局预览
      </div>
      <div v-else-if="!normalizedWidgetList.length" class="preview-state flex-center text-grey">
        <span class="tsfont-m-dashboard mr-xs"></span>
        暂无布局预览
      </div>
      <div v-else :style="shellStyle" class="preview-canvas-shell">
        <div :style="canvasStyle" class="preview-canvas">
          <div
            v-for="widget in visibleWidgetList"
            :key="widget.i"
            :style="getWidgetStyle(widget)"
            :class="[
              'preview-widget radius-md',
              {
                'bg-block': !isWidgetBackgroundTransparent(widget),
                'shadow': !isWidgetBackgroundTransparent(widget),
                'is-welcome-widget': widget.type === 'welcomeOverview'
              }
            ]"
          >
            <div v-if="widget.showTitle !== 0" class="preview-widget__title overflow">
              {{ widget.name || getWidgetLabel(widget.type) }}
            </div>
            <div :class="['preview-widget__body', { 'without-title': widget.showTitle === 0 }]">
              <WorkbenchPreviewWidget
                :widget="widget"
                :presentationType="getPresentationType(widget.type)"
                :mode="mode"
              ></WorkbenchPreviewWidget>
            </div>
          </div>
        </div>
      </div>
    </div>
    <button
      v-if="isReady && normalizedWidgetList.length && mode === 'card'"
      type="button"
      class="preview-more bg-block"
      @click.stop="openPreview"
    >
      <span v-if="remainingCount > 0">还有 {{ remainingCount }} 个组件 · </span>
      <span class="text-href">查看完整布局</span>
    </button>
  </div>
</template>

<script>
import WorkbenchPreviewWidget from './workbench-preview-widget.vue';
import { getWorkbenchBottom, resolveWorkbenchLayout } from '../utils/workbench-layout.js';

const CARD_ROW_LIMIT = 18;
const CARD_ROW_HEIGHT = 12;
const CARD_GAP = 3;
const DETAIL_ROW_HEIGHT = 30;
const DETAIL_GAP = 12;

function normalizeNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.floor(number) : fallback;
}

export default {
  name: 'WorkbenchLayoutPreview',
  components: {
    WorkbenchPreviewWidget
  },
  props: {
    widgetList: { type: Array, default: () => [] },
    presentationMap: { type: Object, default: () => ({}) },
    labelMap: { type: Object, default: () => ({}) },
    mode: { type: String, default: 'card' },
    lazy: { type: Boolean, default: false }
  },
  data() {
    return {
      isReady: !this.lazy,
      observer: null
    };
  },
  mounted() {
    this.observeVisibility();
    this.$nextTick(this.disablePreviewInteraction);
  },
  updated() {
    this.$nextTick(this.disablePreviewInteraction);
  },
  beforeDestroy() {
    this.disconnectObserver();
  },
  methods: {
    observeVisibility() {
      if (!this.lazy || this.isReady || typeof IntersectionObserver === 'undefined') {
        this.isReady = true;
        return;
      }
      this.observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          this.isReady = true;
          this.disconnectObserver();
        }
      }, {
        rootMargin: '300px'
      });
      this.observer.observe(this.$refs.previewRoot);
    },
    disconnectObserver() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
    },
    disablePreviewInteraction() {
      const previewDemo = this.$refs.previewDemo;
      if (!previewDemo) {
        return;
      }
      previewDemo
        .querySelectorAll('a[href], button, input, select, textarea, [tabindex], [contenteditable="true"]')
        .forEach(element => {
          element.setAttribute('tabindex', '-1');
        });
    },
    openPreview() {
      if (this.mode === 'card') {
        this.$emit('open');
      }
    },
    getWidgetStyle(widget) {
      return {
        gridColumn: `${widget.x + 1} / span ${widget.w}`,
        gridRow: `${widget.y + 1} / span ${widget.h}`
      };
    },
    getPresentationType(type) {
      return this.presentationMap[type] || 'list';
    },
    getWidgetLabel(type) {
      return this.labelMap[type] || type || '未注册组件';
    },
    isWidgetBackgroundTransparent(widget) {
      return widget && (widget.backgroundTransparent === 1 || widget.backgroundTransparent === true);
    }
  },
  computed: {
    normalizedWidgetList() {
      const widgetList = (this.widgetList || []).reduce((list, widget, index) => {
        if (!widget || !widget.type) {
          return list;
        }
        const x = normalizeNumber(widget.x, -1);
        const y = normalizeNumber(widget.y, -1);
        const w = normalizeNumber(widget.w, 0);
        const h = normalizeNumber(widget.h, 0);
        if (x < 0 || y < 0 || w < 1 || h < 1 || x + w > 12) {
          return list;
        }
        const i = widget.i || widget.uuid || `${widget.type}-${index}`;
        list.push({
          ...widget,
          i,
          uuid: i,
          x,
          y,
          w,
          h,
          name: widget.name || this.getWidgetLabel(widget.type)
        });
        return list;
      }, []);
      return resolveWorkbenchLayout(widgetList);
    },
    visibleWidgetList() {
      if (this.mode !== 'card') {
        return this.normalizedWidgetList;
      }
      return this.normalizedWidgetList.filter(widget => widget.y + widget.h <= CARD_ROW_LIMIT);
    },
    remainingCount() {
      if (this.mode !== 'card') {
        return 0;
      }
      return this.normalizedWidgetList.length - this.visibleWidgetList.length;
    },
    canvasRows() {
      if (this.mode !== 'card') {
        return Math.max(1, getWorkbenchBottom(this.normalizedWidgetList));
      }
      const visibleBottom = getWorkbenchBottom(this.visibleWidgetList);
      return Math.min(CARD_ROW_LIMIT, Math.max(8, visibleBottom));
    },
    rowHeight() {
      return this.mode === 'card' ? CARD_ROW_HEIGHT : DETAIL_ROW_HEIGHT;
    },
    gap() {
      return this.mode === 'card' ? CARD_GAP : DETAIL_GAP;
    },
    canvasHeight() {
      return this.canvasRows * this.rowHeight + Math.max(0, this.canvasRows - 1) * this.gap;
    },
    shellStyle() {
      if (this.mode === 'card') {
        return {
          width: '100%',
          height: `${this.canvasHeight}px`
        };
      }
      return {
        width: '100%',
        height: `${this.canvasHeight}px`
      };
    },
    canvasStyle() {
      const style = {
        gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
        gridAutoRows: `${this.rowHeight}px`,
        gap: `${this.gap}px`,
        height: `${this.canvasHeight}px`
      };
      return {
        ...style,
        width: '100%'
      };
    }
  }
};
</script>

<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';

.workbench-layout-preview {
  position: relative;
  min-width: 0;
  overflow: hidden;
}

.is-card {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 12px 12px 0;
  background-size: 16px 16px;
  background-image: radial-gradient(circle, var(--border-color, @default-border) 0.6px, transparent 0.8px);
}

.is-detail {
  overflow: visible;
}

.preview-demo {
  pointer-events: none;
}

.preview-state {
  width: 100%;
  min-height: 360px;
  font-size: 13px;
}

.is-card .preview-state {
  min-height: 117px;
}

.preview-canvas-shell {
  position: relative;
}

.preview-canvas {
  display: grid;
  position: relative;
  align-content: start;
  transform-origin: left top;
}

.preview-widget {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.preview-widget__title {
  height: 32px;
  padding: 8px 10px 0;
  font-size: 13px;
  font-weight: 600;
}

.preview-widget__body {
  height: calc(100% - 32px);
  padding: 4px 10px 10px;
  overflow: hidden;

  &.without-title {
    height: 100%;
    padding-top: 10px;
  }
}

.is-card {
  .preview-widget.is-welcome-widget {
    .preview-widget__title {
      height: 18px;
      padding: 3px 6px 0;
      font-size: 9px;
      line-height: 15px;
    }

    .preview-widget__body {
      height: calc(100% - 18px);
      padding: 0 6px 2px;

      &.without-title {
        height: 100%;
        padding-top: 2px;
      }
    }
  }

  .preview-widget__title {
    height: 23px;
    padding: 5px 6px 0;
    font-size: 10px;
  }

  .preview-widget__body {
    height: calc(100% - 23px);
    padding: 2px 6px 5px;

    &.without-title {
      height: 100%;
      padding-top: 5px;
    }
  }
}

.preview-more {
  flex: 0 0 40px;
  width: 100%;
  height: 40px;
  margin-top: auto;
  padding: 0;
  border: 0;
  text-align: center;
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;

}
</style>
