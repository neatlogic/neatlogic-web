<template>
  <div class="portal-widget-preview radius-lg">
    <component
      :is="widgetComponent"
      v-if="widgetComponent"
      :widget="widget"
      :config="componentConfig"
      :title="displayTitle"
      :showTitle="isTitleVisible"
    ></component>
    <NoData v-else></NoData>
  </div>
</template>

<script>
import { WORKBENCH_WIDGET_COMPONENT_MAP } from './components/index.js';
import { getWidgetByName } from '../widget-definition.js';

export default {
  name: 'WidgetRenderer',
  props: {
    widget: { type: Object }
  },
  computed: {
    widgetMeta() {
      return this.widget && this.widget.type ? getWidgetByName(this.widget.type) : null;
    },
    widgetComponent() {
      return this.widgetMeta ? WORKBENCH_WIDGET_COMPONENT_MAP[this.widgetMeta.name] : null;
    },
    componentConfig() {
      return {
        ...((this.widgetMeta && this.widgetMeta.config) || {}),
        ...((this.widget && this.widget.config) || {})
      };
    },
    displayTitle() {
      return (this.widget && this.widget.name) || (this.widgetMeta && this.widgetMeta.label) || '';
    },
    isTitleVisible() {
      return !this.widget || this.widget.showTitle !== 0;
    }
  }
};
</script>

<style lang="less" scoped>
.portal-widget-preview {
  height: 100%;
  overflow: hidden;
  color: inherit;
  background: transparent;
}
</style>
