<template>
  <div>
    <component
      :is="widget.type + 'WidgetConfig'"
      ref="widgetConfig"
      :widget="widget"
      :config="widget.config"
      @setConfig="setConfig"
    ></component>
  </div>
</template>
<script>
import * as configers from './index.js';

export default {
  name: '',
  components: {
    ...configers
  },
  props: {
    widget: {type: Object}
  },
  data() {
    return {};
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    setConfig(attrName, attrValue) {
      if (attrName.indexOf('.') === -1) {
        // 直接设置属性
        this.$set(this.widget.config, attrName, attrValue);
      } else {
        // 处理嵌套属性
        const path = attrName.split('.');
        let obj = this.widget.config;
        for (let i = 0; i < path.length - 1; i++) {
          // 使用 Vue.set 确保响应性
          if (!obj[path[i]]) {
            this.$set(obj, path[i], {});
          }
          obj = obj[path[i]];
        }
        // 最后一级属性使用 Vue.set 确保响应性
        this.$set(obj, path[path.length - 1], attrValue);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
