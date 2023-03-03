<template>
  <div style="font-size:0px">
    <!--font-size:0px用于消除自适应尺寸时出现的滚动条-->
    <img v-if="widget.config.imageUrl" :style="style" :src="widget.config.imageUrl">
  </div>
</template>
<script>
import { WidgetBase } from '../widget-base.js';
export default {
  name: '',
  components: {},
  extends: WidgetBase,
  props: {},
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
  methods: {},
  filter: {},
  computed: {
    style() {
      const style = {};
      if (this.widget.config.autoFit) {
        style.height = '100%';
        style.width = '100%';
      }
      return style;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
</style>
