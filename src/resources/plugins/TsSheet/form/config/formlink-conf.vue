<template>
  <div>
    <TsFormItem label="显示文字" labelPosition="top" required>
      <TsFormInput
        :value="config.text"
        :maxlength="inputMaxlength"
        :validateList="validateList"
        border="border"
        :disabled="disabled"
        @on-change="val => {
          setConfig('text', val);
        }"
      ></TsFormInput>
    </TsFormItem>
    <TsFormItem label="跳转地址" labelPosition="top" required>
      <TsFormInput
        :value="config.value"
        :maxlength="inputMaxlength"
        :validateList="urlValidateList"
        border="border"
        :disabled="disabled"
        @on-change="val => {
          setConfig('value', val);
        }"
      ></TsFormInput>
    </TsFormItem>
    <TsFormItem label="打开方式" labelPosition="top" required>
      <TsFormRadio
        :value="config.target"
        :dataList="targetList"
        :disabled="disabled"
        @on-change="val => {
          setConfig('target', val);
        }"
      ></TsFormRadio>
    </TsFormItem>
  </div>
</template>
<script>
import base from './base-config.vue';
export default {
  name: '',
  components: {
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormRadio: resolve => require(['@/resources/plugins/TsForm/TsFormRadio'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  extends: base,
  props: {},
  data() {
    return {
      inputMaxlength: 100,
      validateList: ['required'],
      urlValidateList: ['required', 'url'],
      targetList: [
        {
          text: '新窗口',
          value: '_blank'
        },
        {
          text: '当前窗口',
          value: '_self'
        }
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
  methods: {},
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
