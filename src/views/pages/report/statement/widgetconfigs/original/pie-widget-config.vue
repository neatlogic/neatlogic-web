<template>
  <div class="pb-nm">
    <TsFormItem :label="$t('term.report.innerradius')" labelPosition="top">
      <div class="pl-sm pr-sm">
        <Slider
          :value="getConfigValue('innerRadius', 0)"
          :min="0"
          :max="0.9"
          :step="0.1"
          show-tip="never"
          @on-change="val => {
            setConfigValue('innerRadius', val);
          }"
        ></Slider>
      </div>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.axis.showlegend')" labelPosition="top">
      <TsFormSwitch
        :value="getConfigValue('legend.visible', true)"
        :true-value="true"
        :false-value="false"
        @change="val => {
          setConfigValue('legend.visible', val);
        }"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.axis.legendlayout')" labelPosition="top">
      <TsFormRadio
        :value="getConfigValue('legend.layout', 'horizontal')"
        :dataList="layoutList"
        @change="val => {
          setConfigValue('legend.layout', val);
        }"
      ></TsFormRadio>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.axis.legendposition')" labelPosition="top">
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
    <TsFormItem :label="$t('term.report.datalayout')" labelPosition="top">
      <TsFormRadio
        :value="getConfigValue('label.type', 'inner')"
        :dataList="labelTypeList"
        @change="val => {
          setConfigValue('label.type', val);
        }"
      ></TsFormRadio>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.statisticcolor')" labelPosition="top">
      <ColorPicker
        :value="getConfigValue('label.style.fill', '')"
        :transfer="true"
        alpha
        recommend
        class="colorPicker"
        transfer-class-name="color-picker-transfer-class"
        @on-change="
          val => {
            setConfigValue('label.style.fill', val);
            setConfigValue('statistic.title.style.color', val);
            setConfigValue('statistic.content.style.color', val);
          }
        "
      />
    </TsFormItem>
    <TsFormItem :label="$t('term.report.statisticfontsize')" labelPosition="top">
      <div class="pl-sm pr-sm">
        <Slider
          :value="getConfigValue('labelFontSize', 12)"
          :min="12"
          :max="50"
          :step="1"
          @on-change="
            val => {
              setConfigValue('labelFontSize', val|| 12);
              setConfigValue('label.style.fontSize', val || 12);
            }
          "
        ></Slider>
      </div>
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
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio')
    //TsFormInput:()=>import('@/resources/plugins/TsForm/TsFormInput')
  },
  extends: WidgetBaseConfig,
  props: { config: { type: Object } },
  data() {
    return {
      layoutList: [
        { value: 'horizontal', text: this.$t('term.report.horizontallayout') },
        { value: 'vertical', text: this.$t('term.report.verticallayout') }
      ],
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
      ],
      labelTypeList: [
        { value: 'inner', text: this.$t('term.report.positions.inner')},
        { value: 'outer', text: this.$t('term.report.positions.outer')},
        { value: 'spider', text: this.$t('term.report.positions.spider') }
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
<style lang="less" scoped>
</style>
