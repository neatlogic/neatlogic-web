<template>
  <div>
    <component
      :is="widget.type + 'WidgetConfig'"
      ref="widgetConfig"
      :widget="widget"
      :config="widget.config || {}"
      @setConfig="setConfig"
    ></component>
  </div>
</template>
<script>
import * as configers from './index.js';
import { WIDGETS } from '../widgets/widget-list.js';

function cloneConfig(config) {
  if (!config || typeof config !== 'object') {
    return {};
  }
  return JSON.parse(JSON.stringify(config));
}

function mergeConfig(defaultConfig, currentConfig) {
  const result = cloneConfig(defaultConfig);
  Object.keys(currentConfig || {}).forEach(key => {
    const currentValue = currentConfig[key];
    const defaultValue = result[key];
    if (
      currentValue &&
      typeof currentValue === 'object' &&
      !Array.isArray(currentValue) &&
      defaultValue &&
      typeof defaultValue === 'object' &&
      !Array.isArray(defaultValue)
    ) {
      result[key] = mergeConfig(defaultValue, currentValue);
    } else {
      result[key] = currentValue;
    }
  });
  return result;
}

export default {
  name: '',
  components: {
    ...configers
  },
  props: {
    widget: { type: Object }
  },
  data() {
    return {};
  },
  created() {
    this.ensureWidgetConfig();
  },
  mounted() {
    this.ensureWidgetConfig();
  },
  methods: {
    ensureWidgetConfig() {
      if (!this.widget) {
        return;
      }
      const widgetDefine = WIDGETS.find(item => item.name === this.widget.type);
      const defaultConfig = widgetDefine && widgetDefine.config ? widgetDefine.config : {};
      const currentConfig = this.widget.config && typeof this.widget.config === 'object' ? this.widget.config : {};
      const nextConfig = mergeConfig(defaultConfig, currentConfig);
      if (!this.widget.config) {
        this.$set(this.widget, 'config', nextConfig);
      } else {
        Object.keys(nextConfig).forEach(key => {
          this.$set(this.widget.config, key, nextConfig[key]);
        });
      }
    },
    setConfig(attrName, attrValue) {
      this.ensureWidgetConfig();
      if (attrName.indexOf('.') === -1) {
        // 直接设置一级配置，兼容旧组件缺少 config 的情况。
        this.$set(this.widget.config, attrName, attrValue);
      } else {
        // 设置嵌套配置时逐级补对象，避免旧数据中间层为空或被关成 false。
        const path = attrName.split('.');
        let obj = this.widget.config;
        for (let i = 0; i < path.length - 1; i++) {
          if (!obj[path[i]] || typeof obj[path[i]] !== 'object') {
            this.$set(obj, path[i], {});
          }
          obj = obj[path[i]];
        }
        this.$set(obj, path[path.length - 1], attrValue);
      }
    }
  },
  watch: {
    widget: {
      handler() {
        this.ensureWidgetConfig();
      },
      immediate: true
    }
  }
};
</script>
<style lang="less">
</style>
