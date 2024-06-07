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
  </div>
</template>
<script>
import base from './base-config.vue';

export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
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
