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
import base from './base-config.vue';
import { Graph, Edge } from '@antv/x6';
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio')
  },
  extends: base,
  props: {
    edge: { type: Edge },
    graph: { type: Graph }
  },
  data() {
    return {
      typeList: [
        { value: 'solid', text: '实线' },
        { value: 'dotted', text: '虚线' }
      ],
      configLocal: this.config
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
    selectIcon(icon) {
      this.setConfig('icon', '#' + icon);
      this.isIconDialogShow = false;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.logo {
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: inline-block;
  position: relative;
  border: 1px solid;
  top: -5px;
  text-align: center;
  line-height: 40px;
  .logo-icon {
    font-size: 20px;
    // position: absolute;
    // top: 4px;
    // left: 10px;
  }
  &::after {
    left: 44px;
    width: 40px;
    position: absolute;
    top: 2px;
  }
}
</style>
