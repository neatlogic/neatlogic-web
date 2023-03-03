<template>
  <li
    class="node-itemli"
    :data-type="node.type"
    draggable="true"
    @dragstart="dropstart($event, node)"
  >
    <svg :width="node.width" :height="node.height">
      <defs>
        <filter
          id="node-shadow-W1iLpm"
          x="-0.5"
          y="-0.5"
          width="200%"
          height="200%"
        >
          <feOffset
            result="offOut"
            in="SourceGraphic"
            dx="0"
            dy="0"
          />
          <feColorMatrix
            result="matrixOut"
            in="offOut"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0"
          />
          <feGaussianBlur result="blurOut" in="matrixOut" stdDeviation="2" />
          <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
        </filter>
      </defs>
      <g filter="url(#node-shadow-W1iLpm)" fill="#F1F3F4" class="node-bg" />
      <use
        :x="node.width / 2 - 8"
        :y="node.height / 2 - 8"
        width="16"
        height="16"
        :href="node.icon"
        fill="#5F6069"
        font-weight="normal"
        class="node-icon"
      />
    </svg>
    <div class="item-text">{{ node.name }}</div>
  </li>
</template>
<script>
import LeftNode from '@/views/pages/process/flow/topoComponent/topo.node.draw.js';
import * as d3 from 'd3';
import '@/resources/plugins/TsTopoNew/js/topo.shape.js'; //节点形状
export default {
  name: '',
  components: {},
  filters: {},
  props: {
    node: Object
  },
  data() {
    return {};
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getShape();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getShape() {
      this.nodeData = new LeftNode(this.node);
      let shape = NodeShape.getShape(this.nodeData).node();
      this.$el.querySelector('g').appendChild(shape);
    },
    dropstart(event, data) {
      // 拖拽开始
      event.dataTransfer.setData('item', JSON.stringify(data));
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
