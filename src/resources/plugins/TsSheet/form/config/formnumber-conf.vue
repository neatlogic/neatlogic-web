<template>
  <div>
    <TsFormItem :label="$t('page.numberrange')" labelPosition="top">
      <div class="padding-sm radius-sm" :class="validClass('minNumber')">
        <TsFormInput
          :value="config.minNumber"
          :placeholder="$t('page.minnumber')"
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
          :placeholder="$t('page.maxnumber')"
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
    <TsFormItem :label="$t('page.decimalnumber')" labelPosition="top">
      <TsFormInput
        :value="config.decimalNumber"
        :placeholder="$t('page.decimalnumber')" 
        :validateList="validateSetting.number" 
        :disabled="disabled"
        @on-change="val => {
          setConfig('decimalNumber', val);
        }"
      ></TsFormInput>
    </TsFormItem>
    <TsFormItem :label="$t('page.inputtip')" labelPosition="top">
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
        { value: 'text', text: this.$t('page.input') },
        { value: 'textarea', text: this.$t('page.textfield') },
        { value: 'password', text: this.$t('page.password') },
        { value: 'number', text: this.$t('page.number') }
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
            message: this.$t('message.framework.maxnumbervalid')
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
