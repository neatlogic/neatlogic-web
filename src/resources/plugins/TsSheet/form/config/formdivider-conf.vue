<template>
  <div>
    <TsFormItem label="文本" labelPosition="top">
      <TsFormInput
        v-model="config.content"
        border="border"
        :disabled="disabled"
      ></TsFormInput>
    </TsFormItem>
    <TsFormItem label="文本位置" labelPosition="top">
      <TsFormRadio
        v-model="config.contentPosition"
        :dataList="positionList"
        :disabled="disabled"
      ></TsFormRadio>
    </TsFormItem>
    <TsFormItem label="颜色" labelPosition="left" contentAlign="right">
      <ColorPicker
        :value="config.dividerColor"
        recommend
        transfer
        class="colorPicker"
        transfer-class-name="color-picker-transfer-class"
        :disabled="disabled"
        @on-change="val => {
          setConfig('dividerColor', val);
        }"
      />
    </TsFormItem>
    <TsFormItem label="类型" labelPosition="left" contentAlign="right">
      <TsFormRadio
        :value="config.dividerType"
        :dataList="dividerTypeList"
        :disabled="disabled"
        @on-change="val => {
          setConfig('dividerType', val);
        }"
      ></TsFormRadio>
    </TsFormItem>
    <TsFormItem label="线宽" labelPosition="top">
      <TsFormInput
        :value="config.dividerWidth"
        type="number"
        :min="1"
        :max="100"
        border="border"
        :disabled="disabled"
        @on-change="val => {
          setConfig('dividerWidth', val);
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
    TsFormRadio: resolve => require(['@/resources/plugins/TsForm/TsFormRadio'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  extends: base,
  props: {},
  data() {
    return {
      dividerTypeList: [
        { text: '实线', value: 'solid' },
        { text: '虚线', value: 'dashed' }
      ],
      positionList: [
        {value: 'start', text: '开始'},
        {value: 'left', text: '靠左'},
        {value: 'center', text: '居中'},
        {value: 'right', text: '靠右'},
        {value: 'end', text: '结尾'}
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
