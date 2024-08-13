<template>
  <div class="pb-nm">
    <TsFormItem :label="$t('term.report.axis.showlegend')" labelPosition="top">
      <TsFormSwitch
        :value="config.legend.visible"
        :true-value="true"
        :false-value="false"
        @change="
          val => {
            setConfigValue('legend.visible', val);
          }
        "
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.axis.legendposition')" labelPosition="top">
      <TsFormSelect
        :value="config.legend.position"
        :transfer="true"
        :clearable="false"
        :dataList="positionList"
        border="border"
        @change="
          val => {
            setConfigValue('legend.position', val);
          }
        "
      ></TsFormSelect>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.statisticcolor')" labelPosition="top">
      <ColorPicker
        :value="config?.geometryOptions[0]?.label?.style?.fill || ''"
        :transfer="true"
        alpha
        recommend
        class="colorPicker"
        transfer-class-name="color-picker-transfer-class"
        @on-change="
          val => {
            if(!config.geometryOptions[1].label.style){
              $set(config.geometryOptions[1].label, 'style', {});
            }
            $set(config.geometryOptions[1].label.style, 'fill', val || defaultSizeColor)
          }
        "
      />
    </TsFormItem>
    <TsFormItem label="统计数据字体大小" labelPosition="top">
      <TsFormSelect
        :value="config.labelFontSize || 12"
        :dataList="axisFontSizeList"
        border="border"
        transfer
        @change="
          val => {
            if(!config.geometryOptions[0].label.style){
              $set(config.geometryOptions[0].label, 'style', {});
            }
            if(!config.geometryOptions[1].label.style){
              $set(config.geometryOptions[1].label, 'style', {});
            }
            $set(config.geometryOptions[0].label.style, 'fontSize', val || 12);
            $set(config.geometryOptions[1].label.style, 'fontSize', val || 12)
          }
        "
      ></TsFormSelect>
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
    // TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
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
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    setConfigValue(attrName, attrValue) {
      if (attrName) {
        this.$emit('setConfig', attrName, attrValue);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {

  }
};
</script>
<style lang="less"></style>
