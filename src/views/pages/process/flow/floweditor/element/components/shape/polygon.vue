<template>
  <div>
    <div class="container">
      <div class="polygon cursor bg-node-grey shadow"></div>
      <div v-if="icon" class="icon" :class="icon"></div>
    </div>
    <div v-if="data.name" style="text-align: center" class="text-grey">{{ data.name }}</div>
  </div>
</template>
<script>
import base from '@/views/pages/process/flow/floweditor/element/components/base.vue';

export default {
  name: 'VuePolygon',
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
    size() {
      return this.node.size().width;
    },
    icon() {
      return this.node.getProp('icon') && this.node.getProp('icon').replace('#', '');
    },
    polySize() {
      return this.size / Math.sqrt(2);
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
  width: 68px;
  height: 68px;
  position: relative;
}
.polygon {
  width: 100%;
  height: 100%;
  height: 50px;
  width: 50px;
  transform: rotate(45deg);
  position: absolute;
  top: 9px;
  left: 9px;
  z-index: -1;
}
.icon {
  z-index: 1;
}
</style>
