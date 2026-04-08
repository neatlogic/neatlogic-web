<template>
  <div v-if="!formItem.isHideComponent">
    <TsFormItem :label="$t('page.inputtip')" labelPosition="top">
      <TsFormInput
        :value="config.placeholder"
        :maxlength="50"
        :disabled="disabled"
        @on-change="
          val => {
            setConfig('placeholder', val);
          }
        "
      ></TsFormInput>
    </TsFormItem>
    <TsFormItem :label="$t('page.codeblocklanguage')" labelPosition="top">
      <TsFormSelect
        :value="config.codeMode"
        :dataList="codeModeList"
        transfer
        border="border"
        :desc="`${$t('page.codeblocklanguage')}${$t('page.example')}：javascript、python`"
        @on-change="(val)=> {
          setConfig('codeMode', val);
          setConfig('componentTopLeftTip', val);
        }"
      ></TsFormSelect>
    </TsFormItem>
  </div>
</template>
<script>
import base from './base-config.vue';
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  extends: base,
  props: {},
  data() {
    return {
      codeModeList: [
        {
          text: 'clike',
          value: 'clike'
        },
        {
          text: 'python',
          value: 'python'
        },
        {
          text: 'ruby',
          value: 'ruby'
        },
        {
          text: 'vbscript',
          value: 'vbscript'
        },
        {
          text: 'perl',
          value: 'perl'
        },
        {
          text: 'powershell',
          value: 'powershell'
        },
        {
          text: 'shell',
          value: 'shell'
        },
        {
          text: 'vue',
          value: 'vue'
        },
        {
          text: 'javascript',
          value: 'javascript'
        },
        {
          text: 'json',
          value: 'json'
        },
        {
          text: 'htmlmixed',
          value: 'htmlmixed'
        },
        {
          text: 'xml',
          value: 'xml'
        },
        {
          text: 'java',
          value: 'java'
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
<style lang="less" scoped>
</style>
