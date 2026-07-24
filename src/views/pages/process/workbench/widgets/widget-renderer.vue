<template>
  <div class="portal-widget-preview radius-lg">
    <component
      :is="componentName"
      v-if="componentName"
      :widget="widget"
      :config="componentConfig"
      :title="displayTitle"
      :showTitle="isTitleVisible"
    ></component>
    <NoData v-else></NoData>
  </div>
</template>

<script>
import * as portalWidgets from './components/index.js';
import { getWidgetByType } from '../widget-definition.js';

export default {
  name: 'WidgetRenderer',
  components: {
    ...portalWidgets
  },
  props: {
    widget: { type: Object }
  },
  computed: {
    widgetMeta() {
      return this.widget && this.widget.type ? getWidgetByType(this.widget.type) : null;
    },
    componentName() {
      return this.widgetMeta && this.widgetMeta.componentName;
    },
    componentConfig() {
      return {
        ...((this.widgetMeta && this.widgetMeta.config) || {}),
        ...((this.widget && this.widget.config) || {})
      };
    },
    displayTitle() {
      return (this.widget && this.widget.name) || (this.widgetMeta && this.widgetMeta.title) || '';
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
