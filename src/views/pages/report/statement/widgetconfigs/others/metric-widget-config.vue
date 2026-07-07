<template>
  <div>
    <TsFormItem :label="$t('term.report.nodatatitle')" labelPosition="top">
      <TsFormInput
        :value="getConfigValue('title', $t('term.report.coremetric'))"
        border="border"
        @change="val => setConfigValue('title', val)"
      ></TsFormInput>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.titlecolor')" labelPosition="top">
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
    <TsFormItem :label="$t('term.report.nodatavalue')" labelPosition="top">
      <TsFormInput
        :value="getConfigValue('defaultValue', 1286)"
        type="number"
        border="border"
        @change="val => setConfigValue('defaultValue', val)"
      ></TsFormInput>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.nodataunit')" labelPosition="top">
      <TsFormInput
        :value="getConfigValue('unit', '')"
        border="border"
        @change="val => setConfigValue('unit', val)"
      ></TsFormInput>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.valueprefix')" labelPosition="top">
      <TsFormInput
        :value="getConfigValue('prefix', '')"
        border="border"
        @change="val => setConfigValue('prefix', val)"
      ></TsFormInput>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.decimalplaces')" labelPosition="top">
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
    <TsFormItem :label="$t('term.report.valuefontsize')" labelPosition="top">
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
    <TsFormItem :label="$t('term.report.thousandseparator')" labelPosition="top">
      <TsFormSwitch
        :value="getConfigValue('useThousands', true)"
        :true-value="true"
        :false-value="false"
        @change="val => setConfigValue('useThousands', val)"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.enablescroll')" labelPosition="top">
      <TsFormSwitch
        :value="getConfigValue('animation', true)"
        :true-value="true"
        :false-value="false"
        @change="val => setConfigValue('animation', val)"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.scrollduration')" labelPosition="top">
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
    <TsFormItem :label="$t('term.report.showtrend')" labelPosition="top">
      <TsFormSwitch
        :value="getConfigValue('showTrend', false)"
        :true-value="true"
        :false-value="false"
        @change="val => setConfigValue('showTrend', val)"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem v-if="getConfigValue('showTrend', false)" :label="$t('term.report.trenddirection')" labelPosition="top">
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
        { value: 'up', text: this.$t('term.report.up') },
        { value: 'down', text: this.$t('term.report.down') }
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
