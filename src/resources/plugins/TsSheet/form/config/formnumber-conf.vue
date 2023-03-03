<template>
  <div>
    <TsFormItem label="数字范围" labelPosition="top">
      <div class="padding-sm radius-sm" :class="validClass('minNumber')">
        <TsFormInput
          :value="config.minNumber"
          placeholder="最小值"
          type="number"
          :max="config.maxNumber"
          :validateList="validateSetting.float"
          :disabled="disabled"
          style="width:48%;display: inline-block;vertical-align: top;"
          @on-change="val => {
            setConfig('minNumber', val);
          }"
        ></TsFormInput>
        -
        <TsFormInput
          :value="config.maxNumber"
          placeholder="最大值"
          type="number"
          :validateList="validateSetting.maxNumber"
          :disabled="disabled"
          style="width:48%;display: inline-block;vertical-align: top;"
          @on-change="val => {
            setConfig('maxNumber', val);
          }"
        ></TsFormInput>
      </div>
    </TsFormItem>
    <TsFormItem label="小数位" labelPosition="top">
      <TsFormInput
        :value="config.decimalNumber"
        placeholder="小数位" 
        :validateList="validateSetting.number" 
        :disabled="disabled"
        @on-change="val => {
          setConfig('decimalNumber', val);
        }"
      ></TsFormInput>
    </TsFormItem>
    <TsFormItem label="输入提示" labelPosition="top">
      <TsFormInput
        :value="config.placeholder"
        :maxlength="50"
        :disabled="disabled"
        @on-change="val => {
          setConfig('placeholder', val);
        }"
      ></TsFormInput>
    </TsFormItem>
  </div>
</template>
<script>
import base from './base-config.vue';

export default {
  name: '',
  components: {
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  extends: base,
  props: {},
  data() {
    let _this = this;
    return {
      typeList: [
        { value: 'text', text: '文本框' },
        { value: 'textarea', text: '文本域' },
        { value: 'password', text: '密码' },
        { value: 'number', text: '数字' }
      ],
      validateSetting: {
        number: ['number'],
        float: ['float'],
        maxNumber: [
          'float',
          {
            name: 'maxNumber',
            validator: function(rule, value) {
              if (!_this.$utils.isEmpty(value) && !_this.$utils.isEmpty(_this.config.minNumber)) {
                return value > _this.config.minNumber;
              } else {
                return true;
              }
            },
            trigger: 'change',
            message: '最大值不得小于等于最小值'
          }
        ]
      }
    };
  },
  beforeCreate() {},
  async created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {},
  filter: {},
  computed: {},
  watch: {}
};
</script>
