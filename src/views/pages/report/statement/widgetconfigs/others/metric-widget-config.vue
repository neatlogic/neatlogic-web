<template>
  <div>
    <TsFormItem label="无数据标题" labelPosition="top">
      <TsFormInput
        :value="getConfigValue('title', '核心指标')"
        border="border"
        @change="val => setConfigValue('title', val)"
      ></TsFormInput>
    </TsFormItem>
    <TsFormItem label="标题颜色" labelPosition="top">
      <ColorPicker
        :value="getConfigValue('titleColor', '')"
        :transfer="true"
        alpha
        recommend
        class="colorPicker"
        transfer-class-name="color-picker-transfer-class"
        @on-change="val => setConfigValue('titleColor', val)"
      />
    </TsFormItem>
    <TsFormItem label="无数据数值" labelPosition="top">
      <TsFormInput
        :value="getConfigValue('defaultValue', 1286)"
        type="number"
        border="border"
        @change="val => setConfigValue('defaultValue', val)"
      ></TsFormInput>
    </TsFormItem>
    <TsFormItem label="无数据单位" labelPosition="top">
      <TsFormInput
        :value="getConfigValue('unit', '')"
        border="border"
        @change="val => setConfigValue('unit', val)"
      ></TsFormInput>
    </TsFormItem>
    <TsFormItem label="数值前缀" labelPosition="top">
      <TsFormInput
        :value="getConfigValue('prefix', '')"
        border="border"
        @change="val => setConfigValue('prefix', val)"
      ></TsFormInput>
    </TsFormItem>
    <TsFormItem label="小数位" labelPosition="top">
      <div class="pl-sm pr-sm">
        <Slider
          :value="getConfigValue('decimals', 0)"
          :min="0"
          :max="4"
          :step="1"
          show-tip="never"
          @on-change="val => setConfigValue('decimals', val)"
        ></Slider>
      </div>
    </TsFormItem>
    <TsFormItem label="数值字号" labelPosition="top">
      <div class="pl-sm pr-sm">
        <Slider
          :value="getConfigValue('fontSize', 46)"
          :min="24"
          :max="96"
          :step="1"
          show-tip="never"
          @on-change="val => setConfigValue('fontSize', val)"
        ></Slider>
      </div>
    </TsFormItem>
    <TsFormItem label="千分位" labelPosition="top">
      <TsFormSwitch
        :value="getConfigValue('useThousands', true)"
        :true-value="true"
        :false-value="false"
        @change="val => setConfigValue('useThousands', val)"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem label="启用滚动" labelPosition="top">
      <TsFormSwitch
        :value="getConfigValue('animation', true)"
        :true-value="true"
        :false-value="false"
        @change="val => setConfigValue('animation', val)"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem label="滚动时长" labelPosition="top">
      <div class="pl-sm pr-sm">
        <Slider
          :value="getConfigValue('duration', 1200)"
          :min="300"
          :max="4000"
          :step="100"
          show-tip="never"
          @on-change="val => setConfigValue('duration', val)"
        ></Slider>
      </div>
    </TsFormItem>
    <TsFormItem label="显示趋势" labelPosition="top">
      <TsFormSwitch
        :value="getConfigValue('showTrend', false)"
        :true-value="true"
        :false-value="false"
        @change="val => setConfigValue('showTrend', val)"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem v-if="getConfigValue('showTrend', false)" label="趋势方向" labelPosition="top">
      <TsFormRadio
        :value="getConfigValue('trendType', 'up')"
        :dataList="trendTypeList"
        @change="val => setConfigValue('trendType', val)"
      ></TsFormRadio>
    </TsFormItem>
  </div>
</template>
<script>
import { WidgetBaseConfig } from '../original/base-config.js';

export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch')
  },
  extends: WidgetBaseConfig,
  props: { config: { type: Object } },
  data() {
    return {
      trendTypeList: [
        { value: 'up', text: '上升' },
        { value: 'down', text: '下降' }
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
