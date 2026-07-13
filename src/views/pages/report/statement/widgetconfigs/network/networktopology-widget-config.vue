<template>
  <div>
    <TsFormItem :label="$t('term.report.topologytemplate')" labelPosition="top">
      <TsFormSelect
        :value="getConfigValue('preset', 'coreAccess')"
        :dataList="presetList"
        :transfer="true"
        @change="val => setConfigValue('preset', val)"
      ></TsFormSelect>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.enableanimation')" labelPosition="top">
      <TsFormSwitch
        :value="getConfigValue('enabled', true)"
        :true-value="true"
        :false-value="false"
        @change="val => setConfigValue('enabled', val)"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.linkflow')" labelPosition="top">
      <TsFormSwitch
        :value="getConfigValue('showFlow', true)"
        :true-value="true"
        :false-value="false"
        @change="val => setConfigValue('showFlow', val)"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.alertpulse')" labelPosition="top">
      <TsFormSwitch
        :value="getConfigValue('showAlarmPulse', true)"
        :true-value="true"
        :false-value="false"
        @change="val => setConfigValue('showAlarmPulse', val)"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.nodebreathing')" labelPosition="top">
      <TsFormSwitch
        :value="getConfigValue('showNodeBreath', true)"
        :true-value="true"
        :false-value="false"
        @change="val => setConfigValue('showNodeBreath', val)"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.nodelabel')" labelPosition="top">
      <TsFormSwitch
        :value="getConfigValue('showLabel', true)"
        :true-value="true"
        :false-value="false"
        @change="val => setConfigValue('showLabel', val)"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.linklabel')" labelPosition="top">
      <TsFormSwitch
        :value="getConfigValue('showLinkLabel', false)"
        :true-value="true"
        :false-value="false"
        @change="val => setConfigValue('showLinkLabel', val)"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.linewidth')" labelPosition="top">
      <div class="pl-sm pr-sm">
        <Slider
          :value="getConfigValue('lineWidth', 2)"
          :min="1"
          :max="8"
          :step="1"
          show-tip="never"
          @on-change="val => setConfigValue('lineWidth', val)"
        ></Slider>
      </div>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.nodesize')" labelPosition="top">
      <div class="pl-sm pr-sm">
        <Slider
          :value="getConfigValue('nodeSize', 28)"
          :min="18"
          :max="54"
          :step="1"
          show-tip="never"
          @on-change="val => setConfigValue('nodeSize', val)"
        ></Slider>
      </div>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.lowperformancemode')" labelPosition="top">
      <TsFormSwitch
        :value="getConfigValue('lowPerformance', false)"
        :true-value="true"
        :false-value="false"
        @change="val => setConfigValue('lowPerformance', val)"
      ></TsFormSwitch>
    </TsFormItem>
  </div>
</template>
<script>
import { WidgetBaseConfig } from '../original/base-config.js';
import { NETWORK_TOPOLOGY_PRESET_LIST } from '../../widgets/network/networktopology-presets.js';

export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch')
  },
  extends: WidgetBaseConfig,
  props: { config: { type: Object } },
  data() {
    return {
      presetList: NETWORK_TOPOLOGY_PRESET_LIST
    };
  },
  methods: {
    setConfigValue(attrName, attrValue) {
      this.$emit('setConfig', attrName, attrValue);
    }
  }
};
</script>
