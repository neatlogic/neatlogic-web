<template>
  <div>
    <TsFormItem label="风险阈值" labelPosition="top">
      <TsFormSelect
        :value="config.warnMinutes"
        :dataList="thresholdList"
        :transfer="true"
        @change="value => setConfig('warnMinutes', value)"
      ></TsFormSelect>
    </TsFormItem>
    <TsFormItem label="显示条数" labelPosition="top">
      <Slider
        :value="config.limit"
        :min="2"
        :max="8"
        :step="1"
        @input="value => setConfig('limit', value)"
      ></Slider>
    </TsFormItem>
    <TsFormItem label="显示风险等级" labelPosition="top">
      <TsFormSwitch
        :value="config.showStatus"
        :trueValue="1"
        :falseValue="0"
        :showStatus="true"
        @on-change="value => setConfig('showStatus', value)"
      ></TsFormSwitch>
    </TsFormItem>
  </div>
</template>

<script>
export default {
  name: 'ProcessSlaRiskConfig',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  props: {
    widget: { type: Object, default: () => ({}) },
    setConfig: { type: Function, required: true }
  },
  data() {
    return {
      thresholdList: [
        { value: 30, text: '30 分钟内' },
        { value: 60, text: '1 小时内' },
        { value: 120, text: '2 小时内' }
      ]
    };
  },
  computed: {
    config() {
      return this.widget.config || {};
    }
  }
};
</script>

