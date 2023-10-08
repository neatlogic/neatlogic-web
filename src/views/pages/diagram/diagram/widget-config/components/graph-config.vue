<template>
  <div>
    <TsFormItem label="背景颜色" labelPosition="top">
      <ColorPicker
        :transfer="true"
        recommend
        :value="graphData.background && graphData.background.color"
        class="colorPicker"
        transfer-class-name="color-picker-transfer-class"
        @on-change="
          val => {
            setValue('background.color', val);
            graph.drawBackground({ color: val });
          }
        "
      />
    </TsFormItem>
    <TsFormItem label="连线类型" labelPosition="top">
      <TsFormRadio
        :vertical="true"
        :value="(graphData.connecting && graphData.connecting.router) || 'manhattan'"
        :dataList="routerTypeList"
        @on-change="
          val => {
            setValue('connecting.router', val);
            graph.getEdges().forEach(edge => {
              edge.setRouter(val);
            });
          }
        "
      ></TsFormRadio>
    </TsFormItem>
  </div>
</template>
<script>
import { Graph } from '@antv/x6';
export default {
  name: '',
  components: {
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormRadio: resolve => require(['@/resources/plugins/TsForm/TsFormRadio'], resolve)
  },
  props: {
    graphData: { type: Object },
    graph: { type: Graph }
  },
  data() {
    return {
      routerTypeList: [
        { value: 'normal', text: '风格一' },
        //{ value: 'orth', text: '正交路由' },
        //{ value: 'oneSide', text: '受限正交路由' },
        { value: 'manhattan', text: '风格二' },
        { value: 'metro', text: '风格三' },
        { value: 'er', text: '风格四' }
      ]
    };
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
    setValue(attr, val) {
      if (!attr.includes('.')) {
        if (!this.graphData.attr) {
          this.$set(this.graphData, attr, val);
        }
      } else {
        const attrs = attr.split('.');
        let currentData = this.graphData;
        for (let i = 0; i < attrs.length - 1; i++) {
          const a = attrs[i];
          if (!currentData[a]) {
            this.$set(currentData, a, {});
          }
          currentData = currentData[a];
        }
        this.$set(currentData, attrs[attrs.length - 1], val);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped></style>
