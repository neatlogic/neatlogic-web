<template>
  <div class="vue_rect_container bg-info-grey" :style="style">
  </div>
</template>
<script>
import base from '@/views/pages/cmdb/graph/graph-editor/element/components/base.vue';

export default {
  name: 'VueZone',
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

      if (this.data.borderRadius) {
        style['border-radius'] = this.data.borderRadius + 'px';
      } else {
        style['border-radius'] = null;
      }

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
.vue_rect_container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%; /* 或其他任何高度 */
}
</style>
