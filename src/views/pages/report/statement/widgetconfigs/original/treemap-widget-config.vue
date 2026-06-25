<template>
  <div class="pb-nm">
    <TsFormItem label="显示图例" labelPosition="top">
      <TsFormSwitch
        :value="getConfigValue('legend.visible', true)"
        :true-value="true"
        :false-value="false"
        @change="val => {
          setConfigValue('legend.visible', val);
        }"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem v-if="getConfigValue('legend.visible', true)" label="图例位置" labelPosition="top">
      <TsFormSelect
        :value="getConfigValue('legend.position', 'bottom')"
        :transfer="true"
        :clearable="false"
        :dataList="positionList"
        @change="val => {
          setConfigValue('legend.position', val);
        }"
      ></TsFormSelect>
    </TsFormItem>
    <TsFormItem label="显示标签" labelPosition="top">
      <TsFormSwitch
        :value="getConfigValue('label.visible', true)"
        :true-value="true"
        :false-value="false"
        @change="val => {
          setConfigValue('label.visible', val);
        }"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem v-if="getConfigValue('label.visible', true)" label="标签颜色" labelPosition="top">
      <ColorPicker
        :value="getConfigValue('label.style.fill', '#ffffff')"
        :transfer="true"
        alpha
        recommend
        transfer-class-name="color-picker-transfer-class"
        @on-change="val => {
          setConfigValue('label.style.fill', val || '#ffffff');
        }"
      />
    </TsFormItem>
    <TsFormItem v-if="getConfigValue('legend.visible', true)" label="图例文字颜色" labelPosition="top">
      <ColorPicker
        :value="getConfigValue('legend.itemName.style.fill', '')"
        :transfer="true"
        alpha
        recommend
        transfer-class-name="color-picker-transfer-class"
        @on-change="val => {
          setConfigValue('legend.itemName.style.fill', val);
        }"
      />
    </TsFormItem>
    <TsFormItem label="启用下钻" labelPosition="top">
      <TsFormSwitch
        :value="getConfigValue('drilldown.enabled', false)"
        :true-value="true"
        :false-value="false"
        @change="val => {
          setConfigValue('drilldown.enabled', val);
        }"
      ></TsFormSwitch>
    </TsFormItem>
  </div>
</template>
<script>
import { WidgetBaseConfig } from './base-config.js';

export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  extends: WidgetBaseConfig,
  props: { config: { type: Object } },
  data() {
    return {
      positionList: [
        { value: 'top-left', text: this.$t('term.report.positions.topleft') },
        { value: 'top', text: this.$t('term.report.positions.top') },
        { value: 'top-right', text: this.$t('term.report.positions.topright') },
        { value: 'bottom-left', text: this.$t('term.report.positions.bottomleft') },
        { value: 'bottom', text: this.$t('term.report.positions.bottom') },
        { value: 'bottom-right', text: this.$t('term.report.positions.bottomright') },
        { value: 'left-top', text: this.$t('term.report.positions.lefttop') },
        { value: 'left', text: this.$t('term.report.positions.left') },
        { value: 'left-bottom', text: this.$t('term.report.positions.leftbottom') },
        { value: 'right-top', text: this.$t('term.report.positions.righttop') },
        { value: 'right', text: this.$t('term.report.positions.right') },
        { value: 'right-bottom', text: this.$t('term.report.positions.rightbottom') }
      ]
    };
  },
  methods: {
    setConfigValue(attrName, attrValue) {
      if (attrName) {
        this.$emit('setConfig', attrName, attrValue);
      }
    }
  }
};
</script>
<style lang="less" scoped></style>
