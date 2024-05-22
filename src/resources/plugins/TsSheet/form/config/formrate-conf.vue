<template>
  <div>
    <TsFormItem :label="$t('page.displaytext')" labelPosition="left" contentAlign="right">
      <TsFormSwitch
        v-model="config.showText"
        :trueValue="true"
        :falseValue="false"
        :disabled="disabled"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem :label="$t('page.ratenumber')" labelPosition="top">
      <TsFormInput
        v-model="config.count"
        border="border"
        type="number"
        :min="1"
        :max="10"
        :disabled="disabled"
        @on-change="countChange()"
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
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch')
  },
  extends: base,
  props: {},
  data() {
    return {
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
  methods: {
    countChange() {
      let{count, defaultValue} = this.config;
      if (defaultValue > count) {
        this.$set(this.config, 'defaultValue', count);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
