<template>
  <div>
    <TsFormItem label="启用动画" labelPosition="top">
      <TsFormSwitch
        :value="getConfigValue('enabled', true)"
        :true-value="true"
        :false-value="false"
        @change="val => setConfigValue('enabled', val)"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem label="方向" labelPosition="top">
      <TsFormRadio
        :value="getConfigValue('direction', 'horizontal')"
        :dataList="directionList"
        @change="val => setConfigValue('direction', val)"
      ></TsFormRadio>
    </TsFormItem>
    <TsFormItem label="速度" labelPosition="top">
      <div class="pl-sm pr-sm">
        <Slider
          :value="getConfigValue('speed', 6)"
          :min="2"
          :max="20"
          :step="1"
          show-tip="never"
          @on-change="val => setConfigValue('speed', val)"
        ></Slider>
      </div>
    </TsFormItem>
    <TsFormItem label="线宽" labelPosition="top">
      <div class="pl-sm pr-sm">
        <Slider
          :value="getConfigValue('lineWidth', 3)"
          :min="1"
          :max="12"
          :step="1"
          show-tip="never"
          @on-change="val => setConfigValue('lineWidth', val)"
        ></Slider>
      </div>
    </TsFormItem>
    <TsFormItem label="虚线" labelPosition="top">
      <TsFormSwitch
        :value="getConfigValue('isDashed', false)"
        :true-value="true"
        :false-value="false"
        @change="val => setConfigValue('isDashed', val)"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem label="发光" labelPosition="top">
      <TsFormSwitch
        :value="getConfigValue('glow', true)"
        :true-value="true"
        :false-value="false"
        @change="val => setConfigValue('glow', val)"
      ></TsFormSwitch>
    </TsFormItem>
  </div>
</template>
<script>
import { WidgetBaseConfig } from '../original/base-config.js';

export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch')
  },
  extends: WidgetBaseConfig,
  props: { config: { type: Object } },
  data() {
    return {
      directionList: [
        { value: 'horizontal', text: '横向' },
        { value: 'vertical', text: '纵向' },
        { value: 'diagonal', text: '斜向' }
      ]
    };
  },
  methods: {
    setConfigValue(attrName, attrValue) {
      this.$emit('setConfig', attrName, attrValue);
    }
  }
};
</script>
