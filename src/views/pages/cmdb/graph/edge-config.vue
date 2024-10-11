<template>
  <div>
    <TsFormItem :label="$t('page.copywriting')" labelPosition="top">
      <TsFormInput
        v-model="text"
        border="border"
        @on-change="
          val => {
            //edge.setLabels(val);
            edge.setAttrByPath('label/text', val);
            //没解决偏移问题，先注释
            /*const id = edge.getAttrByPath('line/id');
            edge.setLabels({
              markup: [
                {
                  tagName: 'text',
                  selector: 'label'
                }
              ],
              attrs: {
                label: {
                  textPath: { href: '#' + id, startOffset: '50%' },
                  textAnchor: 'middle',
                  textVerticalAnchor: 'middle',
                  text: val,
                  fill: '#237804'
                }
              }
            });*/
          }
        "
      ></TsFormInput>
    </TsFormItem>
    <TsFormItem :label="$t('page.color')" labelPosition="top">
      <ColorPicker
        v-model="color"
        :transfer="true"
        recommend
        alpha
        class="colorPicker"
        transfer-class-name="color-picker-transfer-class"
        @on-change="
          val => {
            if (val) {
              edge.setAttrByPath('line/class', null);
              edge.setAttrByPath('line/targetMarker/class', null);
              edge.setAttrByPath('line/sourceMarker/class', null);
              edge.setAttrByPath('line/stroke', val);
              edge.setAttrByPath('line/targetMarker/fill', val);
              edge.setAttrByPath('line/sourceMarker/fill', val);
              edge.setAttrByPath('label/style', 'fill:' + val);
            } else {
              edge.setAttrByPath('line/class', 'line');
              edge.setAttrByPath('line/targetMarker/class', 'marker');
              edge.setAttrByPath('line/sourceMarker/class', 'marker');
              edge.setAttrByPath('line/stroke', null);
              edge.setAttrByPath('line/targetMarker/fill', null);
              edge.setAttrByPath('line/sourceMarker/fill', null);
              edge.setAttrByPath('label/style', null);
            }
          }
        "
      />
    </TsFormItem>
    <TsFormItem :label="$t('page.width')" labelPosition="top">
      <Slider
        :value="width"
        :min="1"
        :max="10"
        @on-change="
          val => {
            edge.setAttrByPath('line/strokeWidth', val);
            if (arrowWidthRate && arrowHeightRate) {
              edge.setAttrByPath('line/targetMarker/width', val / arrowWidthRate);
              edge.setAttrByPath('line/targetMarker/height', val / arrowHeightRate);
              edge.setAttrByPath('line/sourceMarker/width', val / arrowWidthRate);
              edge.setAttrByPath('line/sourceMarker/height', val / arrowHeightRate);
            }
          }
        "
      ></Slider>
    </TsFormItem>
    <TsFormItem :label="$t('term.diagram.sourcemarker')" labelPosition="top">
      <TsFormSelect
        v-model="sourceMarker"
        :dataList="markerList"
        transfer
        border="border"
        @on-change="
          val => {
            edge.setAttrByPath('line/sourceMarker/name', val);
          }
        "
      ></TsFormSelect>
    </TsFormItem>
    <TsFormItem :label="$t('term.diagram.targetmarker')" labelPosition="top">
      <TsFormSelect
        v-model="targetMarker"
        :dataList="markerList"
        transfer
        border="border"
        @on-change="
          val => {
            edge.setAttrByPath('line/targetMarker/name', val);
          }
        "
      ></TsFormSelect>
    </TsFormItem>
    <TsFormItem :label="$t('page.type')" labelPosition="top">
      <TsFormRadio
        v-model="router"
        :vertical="true"
        :dataList="routerTypeList"
        @on-change="
          val => {
            if (val) {
              edge.setRouter(val);
            } else {
              edge.removeRouter();
            }
            resetVertices();
          }
        "
      ></TsFormRadio>
    </TsFormItem>
  </div>
</template>
<script>
import { Edge } from '@antv/x6';
export default {
  name: '',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio')
  },
  props: {
    edge: { type: Edge }
  },
  data() {
    return {
      routerTypeList: [
        { value: 'normal', text: this.$t('term.diagram.line') },
        { value: 'orth', text: this.$t('term.diagram.orth') },
        { value: 'er', text: this.$t('page.relation') },
        { value: 'metro', text: this.$t('term.diagram.metro') },
        { value: 'manhattan', text: this.$t('term.diagram.manhattan') },
        { value: '', text: this.$t('page.custom') }
      ],
      arrowWidthRate: 0,
      arrowHeightRate: 0,
      sourceMarker: null,
      targetMarker: null,
      color: null,
      router: null,
      text: null,
      markerList: [
        { value: null, text: this.$t('page.nothave') },
        { value: 'classic', text: this.$t('term.diagram.classic') },
        { value: 'block', text: this.$t('term.diagram.block') },
        { value: 'cross', text: this.$t('term.diagram.cross') },
        { value: 'circle', text: this.$t('term.report.dot') }
      ]
    };
  },
  beforeCreate() {},
  created() {
    if (this.edge) {
      if (this.arrowWidth) {
        this.arrowWidthRate = this.width / this.arrowWidth;
      }
      if (this.arrowHeight) {
        this.arrowHeightRate = this.width / this.arrowHeight;
      }
      this.sourceMarker = this.edge.getAttrByPath('line/sourceMarker/name');
      this.targetMarker = this.edge.getAttrByPath('line/targetMarker/name');
      this.color = this.edge.getAttrByPath('line/stroke');
      this.router = this.edge.getRouter() && this.edge.getRouter().name;
      this.text = this.edge.getAttrByPath('label/text');
    }
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    resetVertices() {
      if (!this.edge.getRouter()) {
        const sourcePos = this.edge.getSourcePoint();
        const targetPos = this.edge.getTargetPoint();
        this.edge.setVertices([
          {
            x: sourcePos.x + (targetPos.x - sourcePos.x) / 2,
            y: sourcePos.y
          },
          { x: sourcePos.x + (targetPos.x - sourcePos.x) / 2, y: targetPos.y }
        ]);
        this.edge.addTools({
          name: 'vertices',
          args: {
            attrs: { fill: '#444' }
          }
        });
      } else {
        this.edge.setVertices([]);
        if (this.edge.hasTool('vertices')) {
          this.edge.removeTool('vertices');
        }
      }
    }
  },
  filter: {},
  computed: {
    arrowWidth() {
      if (this.edge) {
        return this.edge.getAttrByPath('line/targetMarker/width');
      }
      return 0;
    },
    arrowHeight() {
      if (this.edge) {
        return this.edge.getAttrByPath('line/targetMarker/height');
      }
      return 0;
    },
    width() {
      if (this.edge) {
        return this.edge.getAttrByPath('line/strokeWidth');
      }
      return null;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped></style>
