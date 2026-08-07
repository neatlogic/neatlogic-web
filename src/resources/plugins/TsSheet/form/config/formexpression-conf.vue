<template>
  <div>
    <TsFormItem :label="$t('term.cmdb.expression')" labelPosition="top">
      <ExpressionSetting
        ref="formitem_expression"
        :formItemList="formItemList"
        :formItemUuid="formItem.uuid"
        :value="formItem.config.expression"
        isRequired
        @setConfig="(val)=>{
          $set(formItem.config, 'expression', val)
        }"
      ></ExpressionSetting>
    </TsFormItem>
  </div>
</template>
<script>
import base from './base-config.vue';
export default {
  name: '',
  components: {
    ExpressionSetting: () => import('@/resources/plugins/TsSheet/form/config/common/expression-setting.vue'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem')
  },
  extends: base,
  props: {},
  data() {
    return {
      initData: null
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
