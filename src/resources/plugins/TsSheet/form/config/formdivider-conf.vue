<template>
  <div>
    <TsFormItem :label="$t('page.text')" labelPosition="top">
      <TsFormInput
        v-model="config.content"
        border="border"
        :disabled="disabled"
      ></TsFormInput>
    </TsFormItem>
    <TsFormItem :label="$t('page.contentPosition')" labelPosition="top">
      <TsFormRadio
        v-model="config.contentPosition"
        :dataList="positionList"
        :disabled="disabled"
      ></TsFormRadio>
    </TsFormItem>
    <TsFormItem :label="$t('page.color')" labelPosition="left" contentAlign="right">
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
    <TsFormItem :label="$t('page.type')" labelPosition="left" contentAlign="right">
      <TsFormRadio
        :value="config.dividerType"
        :dataList="dividerTypeList"
        :disabled="disabled"
        @on-change="val => {
          setConfig('dividerType', val);
        }"
      ></TsFormRadio>
    </TsFormItem>
    <TsFormItem :label="$t('page.dividderwidth')" labelPosition="top">
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
        { text: this.$t('page.solid'), value: 'solid' },
        { text: this.$t('page.dashed'), value: 'dashed' }
      ],
      positionList: [
        {value: 'start', text: this.$t('page.begin')},
        {value: 'left', text: this.$t('page.left')},
        {value: 'center', text: this.$t('page.centeralign')},
        {value: 'right', text: this.$t('page.right')},
        {value: 'end', text: this.$t('page.end')}
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
