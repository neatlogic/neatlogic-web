<template>
  <div>
    <TsFormItem :label="$t('term.report.showtitle')" labelPosition="top">
      <TsFormSwitch
        :value="getConfigValue('showTitle', false)"
        :true-value="true"
        :false-value="false"
        @change="val => setConfigValue('showTitle', val)"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem v-if="getConfigValue('showTitle', false)" :label="$t('page.title')" labelPosition="top">
      <TsFormInput
        :value="getConfigValue('title', $t('term.report.resourceusage'))"
        border="border"
        @change="val => setConfigValue('title', val)"
      ></TsFormInput>
    </TsFormItem>
    <TsFormItem v-if="getConfigValue('showTitle', false)" :label="$t('term.report.titlecolor')" labelPosition="top">
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
    <TsFormItem :label="$t('term.report.chartsetting.showvalue')" labelPosition="top">
      <TsFormSwitch
        :value="getConfigValue('showValue', true)"
        :true-value="true"
        :false-value="false"
        @change="val => setConfigValue('showValue', val)"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.showtargetvalue')" labelPosition="top">
      <TsFormSwitch
        :value="getConfigValue('showTarget', false)"
        :true-value="true"
        :false-value="false"
        @change="val => setConfigValue('showTarget', val)"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.valueinprogressbar')" labelPosition="top">
      <TsFormSwitch
        :value="getConfigValue('textInside', false)"
        :true-value="true"
        :false-value="false"
        @change="val => setConfigValue('textInside', val)"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.displaycount')" labelPosition="top">
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
    <TsFormItem :label="$t('term.report.progressbarheight')" labelPosition="top">
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
