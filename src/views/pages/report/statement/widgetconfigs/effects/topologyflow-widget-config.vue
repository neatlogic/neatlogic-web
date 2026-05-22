<template>
  <div>
    <TsFormItem label="展示模式" labelPosition="top">
      <TsFormSelect
        :value="getConfigValue('renderMode', 'normal')"
        :dataList="renderModeList"
        :transfer="true"
        @change="changeRenderMode"
      ></TsFormSelect>
    </TsFormItem>
    <TsFormItem label="启用动画" labelPosition="top">
      <TsFormSwitch
        :value="getConfigValue('enabled', true)"
        :true-value="true"
        :false-value="false"
        @change="val => setConfigValue('enabled', val)"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem label="拓扑模板" labelPosition="top">
      <TsFormSelect
        :value="getConfigValue('preset', 'ops')"
        :dataList="presetList"
        :transfer="true"
        @change="val => setConfigValue('preset', val)"
      ></TsFormSelect>
    </TsFormItem>
    <TsFormItem label="流动方向" labelPosition="top">
      <TsFormRadio
        :value="getConfigValue('direction', 'forward')"
        :dataList="directionList"
        @change="val => setConfigValue('direction', val)"
      ></TsFormRadio>
    </TsFormItem>
    <TsFormItem label="流动速度" labelPosition="top">
      <div class="pl-sm pr-sm">
        <Slider
          :value="getConfigValue('speed', 8)"
          :min="1"
          :max="30"
          :step="1"
          show-tip="never"
          @on-change="val => setConfigValue('speed', val)"
        ></Slider>
      </div>
    </TsFormItem>
    <TsFormItem label="流光长度" labelPosition="top">
      <div class="pl-sm pr-sm">
        <Slider
          :value="getConfigValue('flowLength', 10)"
          :min="4"
          :max="28"
          :step="1"
          show-tip="never"
          @on-change="val => setConfigValue('flowLength', val)"
        ></Slider>
      </div>
    </TsFormItem>
    <TsFormItem v-if="!isAmbientMode" label="流光密度" labelPosition="top">
      <div class="pl-sm pr-sm">
        <Slider
          :value="getConfigValue('flowDensity', 1)"
          :min="1"
          :max="3"
          :step="1"
          show-tip="never"
          @on-change="val => setConfigValue('flowDensity', val)"
        ></Slider>
      </div>
    </TsFormItem>
    <TsFormItem label="线条样式" labelPosition="top">
      <TsFormRadio
        :value="getConfigValue('lineStyle', 'solid')"
        :dataList="lineStyleList"
        @change="val => setConfigValue('lineStyle', val)"
      ></TsFormRadio>
    </TsFormItem>
    <TsFormItem label="线条端点" labelPosition="top">
      <TsFormRadio
        :value="getConfigValue('lineCap', 'round')"
        :dataList="lineCapList"
        @change="val => setConfigValue('lineCap', val)"
      ></TsFormRadio>
    </TsFormItem>
    <TsFormItem label="线宽" labelPosition="top">
      <div class="pl-sm pr-sm">
        <Slider
          :value="getConfigValue('lineWidth', 2)"
          :min="1"
          :max="10"
          :step="1"
          show-tip="never"
          @on-change="val => setConfigValue('lineWidth', val)"
        ></Slider>
      </div>
    </TsFormItem>
    <TsFormItem label="基础线透明度" labelPosition="top">
      <div class="pl-sm pr-sm">
        <Slider
          :value="getConfigValue('baseOpacity', isAmbientMode ? 0.12 : 0.24)"
          :min="0.05"
          :max="1"
          :step="0.05"
          show-tip="never"
          @on-change="val => setConfigValue('baseOpacity', val)"
        ></Slider>
      </div>
    </TsFormItem>
    <template v-if="!isAmbientMode">
      <TsFormItem label="显示节点" labelPosition="top">
        <TsFormSwitch
          :value="getConfigValue('showNodes', true)"
          :true-value="true"
          :false-value="false"
          @change="val => setConfigValue('showNodes', val)"
        ></TsFormSwitch>
      </TsFormItem>
      <TsFormItem v-if="getConfigValue('showNodes', true)" label="节点样式" labelPosition="top">
        <TsFormRadio
          :value="getConfigValue('nodeStyle', 'dot')"
          :dataList="nodeStyleList"
          @change="val => setConfigValue('nodeStyle', val)"
        ></TsFormRadio>
      </TsFormItem>
      <TsFormItem v-if="getConfigValue('showNodes', true)" label="节点大小" labelPosition="top">
        <div class="pl-sm pr-sm">
          <Slider
            :value="getConfigValue('nodeSize', 4)"
            :min="2"
            :max="12"
            :step="1"
            show-tip="never"
            @on-change="val => setConfigValue('nodeSize', val)"
          ></Slider>
        </div>
      </TsFormItem>
      <TsFormItem v-if="getConfigValue('showNodes', true)" label="节点透明度" labelPosition="top">
        <div class="pl-sm pr-sm">
          <Slider
            :value="getConfigValue('nodeOpacity', 1)"
            :min="0.1"
            :max="1"
            :step="0.05"
            show-tip="never"
            @on-change="val => setConfigValue('nodeOpacity', val)"
          ></Slider>
        </div>
      </TsFormItem>
      <TsFormItem label="低性能模式" labelPosition="top">
        <TsFormSwitch
          :value="getConfigValue('lowPerformance', false)"
          :true-value="true"
          :false-value="false"
          @change="val => setConfigValue('lowPerformance', val)"
        ></TsFormSwitch>
      </TsFormItem>
    </template>
  </div>
</template>
<script>
import { WidgetBaseConfig } from '../original/base-config.js';

export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch')
  },
  extends: WidgetBaseConfig,
  props: { config: { type: Object } },
  data() {
    return {
      renderModeList: [
        { value: 'normal', text: '普通' },
        { value: 'ambient', text: '氛围' }
      ],
      presetList: [
        { value: 'ops', text: '运维链路' },
        { value: 'mesh', text: '网状链路' },
        { value: 'hub', text: '中心辐射' },
        { value: 'pipeline', text: '管道传输' },
        { value: 'vertical', text: '上下链路' },
        { value: 'ring', text: '环形流动' }
      ],
      directionList: [
        { value: 'forward', text: '正向' },
        { value: 'reverse', text: '反向' }
      ],
      lineStyleList: [
        { value: 'solid', text: '实线' },
        { value: 'dashed', text: '虚线' }
      ],
      lineCapList: [
        { value: 'round', text: '圆角' },
        { value: 'butt', text: '直角' }
      ],
      nodeStyleList: [
        { value: 'dot', text: '圆点' },
        { value: 'ring', text: '光环' },
        { value: 'pulse', text: '脉冲' }
      ]
    };
  },
  methods: {
    setConfigValue(attrName, attrValue) {
      this.$emit('setConfig', attrName, attrValue);
    },
    changeRenderMode(val) {
      this.setConfigValue('renderMode', val);
      if (val === 'ambient') {
        this.setConfigValue('showNodes', false);
        this.setConfigValue('flowDensity', 1);
        this.setConfigValue('lowPerformance', true);
        this.setConfigValue('baseOpacity', Math.min(Number(this.getConfigValue('baseOpacity', 0.12)) || 0.12, 0.12));
      }
    }
  },
  computed: {
    isAmbientMode() {
      return this.getConfigValue('renderMode', 'normal') === 'ambient';
    }
  }
};
</script>
