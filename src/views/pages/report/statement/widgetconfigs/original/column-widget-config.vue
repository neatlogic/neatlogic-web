<template>
  <div class="pb-nm">
    <TsFormItem :label="$t('term.report.axis.yaxisshow')" labelPosition="top">
      <TsFormSwitch
        :value="config.yAxis?.hasOwnProperty('visible')?config.yAxis.visible:true"
        :true-value="true"
        :false-value="false"
        @change="
          val => {
            setConfigValue('yAxis.visible', val);
          }
        "
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.axis.yaxistitle')" labelPosition="top">
      <TsFormInput
        :value="config.yAxis.title && config.yAxis.title.text"
        border="border"
        @change="
          val => {
            setConfigValue('yAxis.title.text', val);
          }
        "
      ></TsFormInput>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.axis.xaxisshow')" labelPosition="top">
      <TsFormSwitch
        :value="config.xAxis ? true : false"
        :true-value="true"
        :false-value="false"
        @change="
          val => {
            if (val) {
              setConfigValue('xAxis', {
                label: {
                  autoHide: true,
                  autoEllipsis: true
                },
                title: { text: '' }
              });
            } else {
              setConfigValue('xAxis', val);
            }
          }
        "
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.axis.xaxistitle')" labelPosition="top">
      <TsFormInput
        :value="config.xAxis.title && config.xAxis.title.text"
        border="border"
        @change="
          val => {
            setConfigValue('xAxis.title.text', val);
          }
        "
      ></TsFormInput>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.axis.columnwidth')" labelPosition="top">
      <div class="pl-md">
        <Slider
          :value="config.columnWidthRatio"
          :min="0.1"
          :max="0.9"
          :step="0.1"
          show-tip="never"
          @on-change="
            val => {
              setConfigValue('columnWidthRatio', val);
            }
          "
        ></Slider>
      </div>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.customcolor')" labelPosition="top">
      <ColorPicker
        :value="config.color"
        :transfer="true"
        alpha
        recommend
        class="colorPicker"
        transfer-class-name="color-picker-transfer-class"
        @on-change="
          val => {
            setConfigValue('color', val);
          }
        "
      />
    </TsFormItem>
    <TsFormItem :label="$t('term.report.statisticcolor')" labelPosition="top">
      <ColorPicker
        :value="config.label && config.label.style && config.label.style.fill"
        :transfer="true"
        alpha
        recommend
        class="colorPicker"
        transfer-class-name="color-picker-transfer-class"
        @on-change="
          val => {
            setConfigValue('label.style.fill', val || defaultSizeColor);
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
            setConfigValue('labelFontSize', val || 12);
            setConfigValue('label.style.fontSize', val || 12);
          }
        "
      ></TsFormSelect>
    </TsFormItem>
    <TsFormItem label="辅助线" labelPosition="top">
      <TsFormSwitch
        :value="!!config.yAxis?.hasOwnProperty('grid')?!!config.yAxis.grid:true"
        :true-value="true"
        :false-value="false"
        @change="
          val => {
            setConfigValue('yAxis.grid.visible', val);
          }
        "
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem label="坐标轴颜色" labelPosition="top">
      <ColorPicker
        :value="config.axisColor"
        :transfer="true"
        alpha
        recommend
        class="colorPicker"
        transfer-class-name="color-picker-transfer-class"
        @on-change="
          val => {
            setConfigValue('axisColor', val);
            setConfigValue('xAxis.title.style.fill', val || defaultSizeColor);
            setConfigValue('xAxis.label.style.fill', val || defaultSizeColor);
            setConfigValue('xAxis.line.style.stroke', val || defaultSizeColor);
            setConfigValue('yAxis.label.style.fill', val || defaultSizeColor);
            setConfigValue('yAxis.title.style.fill', val || defaultSizeColor);
            setConfigValue('yAxis.title.style.fill', val || defaultSizeColor);
          }
        "
      />
    </TsFormItem>
    <TsFormItem label="坐标轴字体大小" labelPosition="top">
      <TsFormSelect
        :value="config.axisFontSize || 12"
        :dataList="axisFontSizeList"
        border="border"
        transfer
        @change="
          val => {
            setConfigValue('axisFontSize', val || defaultFontSize);
            setConfigValue('xAxis.title.style.fontSize', val || defaultFontSize);
            setConfigValue('xAxis.label.style.fontSize', val || defaultFontSize);
            setConfigValue('yAxis.label.style.fontSize', val || defaultFontSize);
            setConfigValue('yAxis.title.style.fontSize', val || defaultFontSize);
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
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
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
      ],
      labelTypeList: [
        { value: 'inner', text: this.$t('term.report.positions.inner') },
        { value: 'outer', text: this.$t('term.report.positions.outer') }
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
  watch: {}
};
</script>
<style lang="less" scoped></style>
