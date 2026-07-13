<template>
  <div>
    <TsFormItem :label="$t('term.report.enableanimation')" labelPosition="top">
      <TsFormSwitch
        :value="getConfigValue('enabled', true)"
        :true-value="true"
        :false-value="false"
        @change="val => setConfigValue('enabled', val)"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.direction')" labelPosition="top">
      <TsFormRadio
        :value="getConfigValue('direction', 'horizontal')"
        :dataList="directionList"
        @change="val => setConfigValue('direction', val)"
      ></TsFormRadio>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.speed')" labelPosition="top">
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
    <TsFormItem :label="$t('term.report.linewidth')" labelPosition="top">
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
    <TsFormItem :label="$t('term.report.dashedline')" labelPosition="top">
      <TsFormSwitch
        :value="getConfigValue('isDashed', false)"
        :true-value="true"
        :false-value="false"
        @change="val => setConfigValue('isDashed', val)"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.glow')" labelPosition="top">
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
        { value: 'horizontal', text: this.$t('term.report.horizontal') },
        { value: 'vertical', text: this.$t('term.report.vertical') },
        { value: 'diagonal', text: this.$t('term.report.diagonal') }
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
