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
    <TsFormItem :label="$t('term.report.scandirection')" labelPosition="top">
      <TsFormRadio
        :value="getConfigValue('direction', 'vertical')"
        :dataList="directionList"
        @change="val => setConfigValue('direction', val)"
      ></TsFormRadio>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.speed')" labelPosition="top">
      <div class="pl-sm pr-sm">
        <Slider
          :value="getConfigValue('speed', 8)"
          :min="3"
          :max="30"
          :step="1"
          show-tip="never"
          @on-change="val => setConfigValue('speed', val)"
        ></Slider>
      </div>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.opacity')" labelPosition="top">
      <div class="pl-sm pr-sm">
        <Slider
          :value="getConfigValue('opacity', 0.28)"
          :min="0.05"
          :max="0.8"
          :step="0.05"
          show-tip="never"
          @on-change="val => setConfigValue('opacity', val)"
        ></Slider>
      </div>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.beamwidth')" labelPosition="top">
      <div class="pl-sm pr-sm">
        <Slider
          :value="getConfigValue('beamSize', 24)"
          :min="8"
          :max="60"
          :step="1"
          show-tip="never"
          @on-change="val => setConfigValue('beamSize', val)"
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
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch')
  },
  extends: WidgetBaseConfig,
  props: { config: { type: Object } },
  data() {
    return {
      directionList: [
        { value: 'vertical', text: this.$t('term.report.vertical') },
        { value: 'horizontal', text: this.$t('term.report.horizontal') }
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
