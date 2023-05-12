<template>
  <div>
    <TsFormItem :label="$t('page.displaytext')" labelPosition="top" required>
      <div class="radius-sm padding-md" :class="validClass('text')">
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
      </div>
    </TsFormItem>
    <TsFormItem :label="$t('term.framework.jumpaddress')" labelPosition="top" required>
      <div class="radius-sm padding-md" :class="validClass('value')">
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
      </div>
    </TsFormItem>
    <TsFormItem :label="$t('term.framework.openmode')" labelPosition="top" required>
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
          text: this.$t('term.framework.hrefblank'),
          value: '_blank'
        },
        {
          text: this.$t('term.framework.hrefself'),
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
