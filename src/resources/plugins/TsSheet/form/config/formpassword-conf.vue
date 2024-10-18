<template>
  <div>
    <TsFormItem :label="$t('page.strlength')" labelPosition="top">
      <TsFormInput
        :value="config.maxLength"
        type="number"
        :disabled="disabled"
        @on-change="val => {
          setConfig('maxLength', val);
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
    <TsFormItem :label="$t('page.viewtarget',{'target':$t('page.auth')})" labelPosition="top">
      <UserSelect
        :value="config.viewPasswordAuthorityList"
        :multiple="true"
        :transfer="true"
        :groupList="['user', 'role', 'team']"
        @on-change="val => {
          setConfig('viewPasswordAuthorityList', val);
        }"
      ></UserSelect>
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
    UserSelect: () => import('@/resources/components/UserSelect/UserSelect.vue')
  },
  extends: base,
  props: {},
  data() {
    return {
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
