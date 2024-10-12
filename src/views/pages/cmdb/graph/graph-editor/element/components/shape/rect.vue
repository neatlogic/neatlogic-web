<template>
  <div style="text-align: center; position: relative; padding-top: 10px" :style="sizeStyle">
    <div class="container shadow bg-grey" style="margin: auto" :style="style">
      <div :class="data.icon" :style="iconStyle"></div>
    </div>
    <div
      v-if="data.name"
      class="text-grey fz10 mt-xs"
      style="white-space: normal; word-break: break-all"
      :style="fontStyle"
    >{{ data.name }}</div>
    <div v-if="data.alertColor" style="position: absolute; z-index: -1; top: 0px; left: 0px">
      <svg data-v-61b1d234="" :width="size.width" :height="size.height">
        <rect
          width="40"
          height="40"
          :x="size.width / 2 - 20"
          :y="10"
          :fill="data.alertColor"
          stroke-width="0"
          fill-opacity="1"
        >
          <animate
            attributeName="x"
            :from="size.width / 2 - 20"
            :to="size.width / 2 - 30"
            dur="1s"
            repeatCount="indefinite"
          ></animate>
          <animate
            attributeName="y"
            :from="10"
            :to="0"
            dur="1s"
            repeatCount="indefinite"
          ></animate>
          <animate
            attributeName="width"
            :from="40"
            :to="60"
            dur="1s"
            repeatCount="indefinite"
          ></animate>
          <animate
            attributeName="height"
            :from="40"
            :to="60"
            dur="1s"
            repeatCount="indefinite"
          ></animate>
          <animate
            attributeName="fill-opacity"
            from="1"
            to="0"
            dur="1s"
            repeatCount="indefinite"
          ></animate>
        </rect>
      </svg>
    </div>
  </div>
</template>
<script>
import base from '@/views/pages/cmdb/graph/graph-editor/element/components/base.vue';

export default {
  name: 'VueRect',
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
}
</style>
