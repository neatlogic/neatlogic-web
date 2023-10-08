<template>
  <TsContain>
    <template v-slot:navigation><span>导航</span></template>
    <template v-slot:topLeft>上左</template>
    <template v-slot:topRight>
      <div class="action-group">
        <div class="action-item"></div>
        <div class="action-item">保存</div>
      </div>
    </template>
    <template v-slot:content>
      <div class="grid">
        <div>
          <TsFormItem label="继承" labelPosition="top">
            <TsFormSelect
              v-model="widgetData.inherit"
              :dataList="inheriList"
              transfer
              border="border"
            ></TsFormSelect>
          </TsFormItem>
          <TsFormItem label="宽度" labelPosition="top">
            <TsFormInput
              v-model="widgetData.width"
              :min="0"
              type="number"
              border="border"
            ></TsFormInput>
          </TsFormItem>
          <TsFormItem label="高度" labelPosition="top">
            <TsFormInput
              v-model="widgetData.height"
              :min="0"
              type="number"
              border="border"
            ></TsFormInput>
          </TsFormItem>
          <TsFormItem label="组件" labelPosition="top">
            <div style="text-align: right"><a class="tsfont-plus" @click="addMarkup">组件</a></div>
            <div v-for="(markup, index) in widgetData.config.markup" :key="index">
              <TsFormItem label="标签名" labelPosition="left" :labelWidth="80">
                <TsFormInput v-model="markup.tagName" border="border"></TsFormInput>
              </TsFormItem>
              <TsFormItem label="样式" labelPosition="left" :labelWidth="80">
                <TsCodemirror v-model="widgetData.config.attrs[markup.selector]" codeMode="json"></TsCodemirror>
              </TsFormItem>
              <Divider v-if="index < widgetData.config.markup.length - 1" />
            </div>
          </TsFormItem>
          <div><Button type="primary" @click="createWidget()">生成</Button></div>
        </div>
        <div><GraphEditor :panning="false" @ready="ready"></GraphEditor></div>
      </div>
    </template>
  </TsContain>
</template>
<script>
import { Graph, Node } from '@antv/x6';

export default {
  name: '',
  components: {
    TsCodemirror: resolve => require(['@/resources/plugins/TsCodemirror/TsCodemirror'], resolve),
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    GraphEditor: resolve => require(['@/views/pages/diagram/diagram/components/graph-editor.vue'], resolve)
  },
  props: {},
  data() {
    return {
      graph: null,
      dnd: null,
      widgetData: { inherit: '', config: { markup: [], attrs: {} } },
      inheriList: [
        { value: 'rect', text: '矩形' },
        { value: 'circle', text: '圆' }
      ],
      formConfig: [
        {
          type: 'slot',
          name: 'inherit',
          label: '继承'
        },
        {
          type: 'slot',
          name: 'markup',
          label: '组件'
        }
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
    ready(graph, dnd) {
      this.graph = graph;
      this.dnd = dnd;
    },
    addMarkup() {
      const uuid = 'abc';//this.$utils.setUuid();
      this.widgetData.config.markup.push({ tagName: '', selector: uuid });
      this.$set(this.widgetData.config.attrs, uuid, '{}');
    },
    createWidget() {
      this.graph.removeNode('demo');
      Graph.unregisterNode('demo-node');
      const widget = this.$utils.deepClone(this.widgetData);
      if (widget.config.attrs) {
        for (let key in widget.config.attrs) {
          const attrValue = widget.config.attrs[key];
          try {
            console.log(attrValue);
            widget.config.attrs[key] = JSON.parse(attrValue);
          } catch (e) {
            console.error(e);
            widget.config.attrs[key] = {};
          }
        }
      }
      try {
        Graph.registerNode('demo-node', { inherit: widget.inherit, markup: widget.config.markup, attrs: widget.config.attrs }, true);
        this.graph.addNode({
          id: 'demo',
          shape: 'demo-node',
          x: 100,
          y: 100,
          width: widget.width,
          height: widget.height,
          label: widget.label
        });
      } catch (e) {
        //
      }
    }
  },
  filter: {},
  computed: {},
  watch: {
  }
};
</script>
<style lang="less" scoped>
.grid {
  display: grid;
  column-gap: 10px;
  grid-template-columns: 50% 50%;
}
</style>
