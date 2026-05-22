<template>
  <div>
    <TsFormItem label="显示标题" labelPosition="top">
      <TsFormSwitch
        :value="getConfigValue('showTitle', true)"
        :true-value="true"
        :false-value="false"
        @change="val => setConfigValue('showTitle', val)"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem v-if="getConfigValue('showTitle', true)" label="标题" labelPosition="top">
      <TsFormInput
        :value="getConfigValue('title', '资源使用率')"
        border="border"
        @change="val => setConfigValue('title', val)"
      ></TsFormInput>
    </TsFormItem>
    <TsFormItem v-if="getConfigValue('showTitle', true)" label="标题颜色" labelPosition="top">
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
    <TsFormItem label="显示数值" labelPosition="top">
      <TsFormSwitch
        :value="getConfigValue('showValue', true)"
        :true-value="true"
        :false-value="false"
        @change="val => setConfigValue('showValue', val)"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem label="显示目标值" labelPosition="top">
      <TsFormSwitch
        :value="getConfigValue('showTarget', false)"
        :true-value="true"
        :false-value="false"
        @change="val => setConfigValue('showTarget', val)"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem label="数值置于进度条内" labelPosition="top">
      <TsFormSwitch
        :value="getConfigValue('textInside', false)"
        :true-value="true"
        :false-value="false"
        @change="val => setConfigValue('textInside', val)"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem label="显示条数" labelPosition="top">
      <div class="pl-sm pr-sm">
        <Slider
          :value="getConfigValue('itemCount', 5)"
          :min="1"
          :max="10"
          :step="1"
          show-tip="never"
          @on-change="val => setConfigValue('itemCount', val)"
        ></Slider>
      </div>
    </TsFormItem>
    <TsFormItem label="进度条高度" labelPosition="top">
      <div class="pl-sm pr-sm">
        <Slider
          :value="getConfigValue('barHeight', 8)"
          :min="4"
          :max="18"
          :step="1"
          show-tip="never"
          @on-change="val => setConfigValue('barHeight', val)"
        ></Slider>
      </div>
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
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch')
  },
  extends: WidgetBaseConfig,
  props: { config: { type: Object } },
  methods: {
    setConfigValue(attrName, attrValue) {
      this.$emit('setConfig', attrName, attrValue);
    }
  }
};
</script>
