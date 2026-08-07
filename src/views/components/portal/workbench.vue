<template>
  <div class="portal-workbench bg-grey padding">
    <Loading v-if="loading" :loadingShow="loading" type="fix"></Loading>
    <div v-else-if="error" class="workbench-state flex-center text-center">
      <slot name="error" :error="error" :retry="retry">
        <NoData :text="error"></NoData>
        <Button type="primary" ghost @click="retry">{{ $t('term.workbench.reload') }}</Button>
      </slot>
    </div>
    <div v-else-if="!normalizedWidgetList.length" class="workbench-empty flex-center text-center">
      <NoData></NoData>
    </div>
    <grid-layout
      v-else
      :layout="normalizedWidgetList"
      :col-num="12"
      :row-height="30"
      :is-draggable="false"
      :is-resizable="false"
      :is-mirrored="false"
      :vertical-compact="true"
      :margin="[12, 12]"
      :use-css-transforms="true"
      class="workbench-grid"
    >
      <grid-item
        v-for="widget in normalizedWidgetList"
        :key="widget.i"
        :x="widget.x"
        :y="widget.y"
        :w="widget.w"
        :h="widget.h"
        :i="widget.i"
        :min-w="widget.minW"
        :min-h="widget.minH"
      >
        <WorkbenchGridItem :widget="widget">
          <template v-slot:widget="{ widget: currentWidget }">
            <slot name="widget" :widget="currentWidget" mode="read"></slot>
          </template>
        </WorkbenchGridItem>
      </grid-item>
    </grid-layout>
  </div>
</template>

<script>
import VueGridLayout from 'vue-grid-layout';
import WorkbenchGridItem from './components/workbench-grid-item.vue';
import { resolveWorkbenchLayout } from './utils/workbench-layout.js';

export default {
  name: 'PortalWorkbench',
  components: {
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
    WorkbenchGridItem
  },
  props: {
    widgetList: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    error: { type: String, default: '' }
  },
  methods: {
    retry() {
      this.$emit('retry');
    }
  },
  computed: {
    normalizedWidgetList() {
      return resolveWorkbenchLayout(this.widgetList);
    }
  }
};
</script>

<style lang="less" scoped>
.portal-workbench {
  position: relative;
  min-height: 100%;
  overflow: auto;
  box-sizing: border-box;
  color: inherit;
  .workbench-state,
  .workbench-empty {
    min-height: 320px;
    flex-direction: column;
    gap: 12px;
  }
  .workbench-grid {
    min-height: 100%;
    ::v-deep .vue-grid-item {
      z-index: 1 !important;
      overflow: hidden;
    }
    ::v-deep .vue-grid-item.vue-grid-placeholder {
      z-index: 0 !important;
      pointer-events: none;
    }
  }
}
</style>
