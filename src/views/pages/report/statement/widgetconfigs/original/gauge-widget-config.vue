<template>
  <div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        {{ $t('page.style') }}
      </label>
      <div class="ivu-form-item-content">
        <TsFormRadio
          :value="getConfigValue('type', '')"
          :dataList="[
            { value: '', text: $t('page.default') },
            { value: 'meter', text: $t('term.report.meter') }
          ]"
          @change="
            val => {
              setConfigValue('type', val);
            }"
        ></TsFormRadio>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">{{ $t('term.dashboard.rangewidth') }}</label>
      <div class="ivu-form-item-content">
        <div class="pl-md pr-md">
          <Slider
            :value="1 - getConfigValue('innerRadius', 0.8)"
            :min="0.05"
            :max="0.5"
            :step="0.05"
            show-tip="never"
            @on-change="
              val => {
                setConfigValue('innerRadius', 1 - val);
              }"
          ></Slider>
        </div>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        {{ $t('term.report.dialcolor') }}
      </label>
      <div class="ivu-form-item-content">
        <ColorPicker
          :value="getColorValue(getConfigValue('range.color', ''))"
          :transfer="true"
          alpha
          recommend
          class="colorPicker"
          transfer-class-name="color-picker-transfer-class"
          @on-change="
            val => {
              setConfigValue('range.color', val);
            }"
        />
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        {{ $t('term.report.pointercolor') }}
      </label>
      <div class="ivu-form-item-content">
        <ColorPicker
          :value="getColorValue(getConfigValue('indicator.pointer.style.stroke', ''))"
          :transfer="true"
          alpha
          recommend
          class="colorPicker"
          transfer-class-name="color-picker-transfer-class"
          @on-change="
            val => {
              setConfigValue('indicator.pointer.style.stroke', val);
            }"
        />
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        {{ $t('term.report.centercolor') }}
      </label>
      <div class="ivu-form-item-content">
        <ColorPicker
          :value="getColorValue(getConfigValue('indicator.pin.style.stroke', ''))"
          :transfer="true"
          alpha
          recommend
          class="colorPicker"
          transfer-class-name="color-picker-transfer-class"
          @on-change="
            val => {
              setConfigValue('indicator.pin.style.stroke', val);
              setConfigValue('indicator.pin.style.fill', val);
            }"
        />
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        {{ $t('term.report.datafontsize') }}
      </label>
      <div class="ivu-form-item-content">
        <div class="pl-md pr-md">
          <Slider
            :value="getConfigValue('statistic.content.style.fontSize', 20)"
            :min="12"
            :max="80"
            :step="1"
            show-tip="never"
            @on-change="val => {
              setConfigValue('statistic.content.style.fontSize', val);
            }"
          ></Slider>
        </div>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        {{ $t('term.report.datacolor') }}
      </label>
      <div class="ivu-form-item-content">
        <ColorPicker
          :value="getColorValue(getConfigValue('statistic.content.style.color', ''))"
          :transfer="true"
          alpha
          recommend
          class="colorPicker"
          transfer-class-name="color-picker-transfer-class"
          @on-change="
            val => {
              setConfigValue('statistic.content.style.color', val);
            }"
        />
      </div>
    </div>
  </div>
</template>
<script>
import { WidgetBaseConfig } from './base-config.js';
export default {
  name: '',
  components: {
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio')
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
    getColorValue(value) {
      if (Array.isArray(value)) {
        return typeof value[0] === 'string' ? value[0] : '';
      }
      return typeof value === 'string' ? value : '';
    },
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
