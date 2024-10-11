<template>
  <div style="text-align: center" :style="sizeStyle">
    <div class="container shadow bg-grey" style="margin:auto" :style="style">
      <div :class="data.icon" :style="iconStyle"></div>
    </div>
    <div
      v-if="data.name"
      class="text-grey fz10 mt-xs"
      style="white-space:normal;word-break:break-all"
      :style="fontStyle"
    >{{ data.name }}</div>
  </div>
</template>
<script>
import base from '@/views/pages/cmdb/graph/graph-editor/element/components/base.vue';

export default {
  name: 'VueCircle',
  components: {},
  extends: base,
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
      if (this.data.borderWidth) {
        style['border-width'] = this.data.borderWidth + 'px';
        style['border-style'] = 'solid';
      } else {
        style['border-width'] = '0px';
        style['border-style'] = null;
      }

      if (this.data.bgColor) {
        style['background'] = this.data.bgColor;
      } else {
        style['background'] = null;
      }

      if (this.data.borderColor) {
        style['border-color'] = this.data.borderColor;
      } else {
        style['border-color'] = null;
      }
      return style;
    },
    iconStyle() {
      const style = {};
      if (this.data.iconColor) {
        style['color'] = this.data.iconColor;
      } else {
        style['color'] = null;
      }
      return style;
    },
    fontStyle() {
      const style = {};
      if (this.data.fontColor) {
        style['color'] = this.data.fontColor;
      } else {
        style['color'] = null;
      }
      return style;
    },
    sizeStyle() {
      const style = {};
      if (this.size) {
        style['width'] = this.size.width + 'px';
        style['height'] = this.size.height + 'px';
      }
      return style;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 40px;
}
</style>
