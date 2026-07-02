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
        :value="getConfigValue('title', 'TOP排名')"
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
    <TsFormItem :label="$t('page.fontcolor')" labelPosition="top">
      <ColorPicker
        :value="getConfigValue('nameColor', '')"
        :transfer="true"
        alpha
        recommend
        class="colorPicker"
        transfer-class-name="color-picker-transfer-class"
        @on-change="val => setConfigValue('nameColor', val)"
      />
    </TsFormItem>
    <TsFormItem label="显示条数" labelPosition="top">
      <div class="pl-sm pr-sm">
        <Slider
          :value="getConfigValue('topN', 6)"
          :min="3"
          :max="12"
          :step="1"
          show-tip="never"
          @on-change="val => setConfigValue('topN', val)"
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
