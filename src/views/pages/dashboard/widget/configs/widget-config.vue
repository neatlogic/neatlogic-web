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
      if (attrName.indexOf('.') == -1) {
        this.$set(this.widget.config, attrName, attrValue);
      } else {
        const str = attrName.split('.');
        let obj = this.widget.config;
        for (let i = 0; i < str.length - 1; i++) {
          if (obj[str[i]]) {
            obj = obj[str[i]];
          } else {
            this.$set(obj, str[i], {});
          }
        }
        this.$set(obj, str[str.length - 1], attrValue);
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
