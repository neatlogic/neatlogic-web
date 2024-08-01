<template>
  <div class="pb-nm">
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        {{ $t('term.report.axis.yaxisshow') }}
      </label>
      <div class="ivu-form-item-content">
        <TsFormSwitch
          :value="config.yAxis ? true : false"
          :true-value="true"
          :false-value="false"
          @change="
            val => {
              if (val) {
                setConfigValue('yAxis', { title: { text: '' } });
              } else {
                setConfigValue('yAxis', val);
              }
            }
          "
        ></TsFormSwitch>
      </div>
    </div>
    <div v-if="config.yAxis" class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        {{ $t('term.report.axis.yaxistitle') }}
      </label>
      <div class="ivu-form-item-content">
        <TsFormInput
          :value="config.yAxis.title && config.yAxis.title.text"
          border="border"
          @change="
            val => {
              setConfigValue('yAxis.title.text', val);
            }
          "
        ></TsFormInput>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        {{ $t('term.report.axis.xaxisshow') }}
      </label>
      <div class="ivu-form-item-content">
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
      </div>
    </div>
    <div v-if="config.xAxis" class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        {{ $t('term.report.axis.xaxistitle') }}
      </label>
      <div class="ivu-form-item-content">
        <TsFormInput
          :value="config.xAxis.title && config.xAxis.title.text"
          border="border"
          @change="
            val => {
              setConfigValue('xAxis.title.text', val);
            }
          "
        ></TsFormInput>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        {{ $t('term.report.smoothcurve') }}
      </label>
      <div class="ivu-form-item-content">
        <TsFormSwitch
          :value="config.smooth"
          :true-value="true"
          :false-value="false"
          @change="
            val => {
              setConfigValue('smooth', val);
            }
          "
        ></TsFormSwitch>
      </div>
    </div>
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
    return {};
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
