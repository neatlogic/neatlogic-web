<template>
  <div>
    <TsFormSelect
      dynamicUrl="/api/rest/worktime/search/forselect"
      transfer
      :value="value"
      :disabled="disabled"
      :params="{ isActive: 1 }"
      rootName="list"
      border="border"
      @on-change="changeValue"
    ></TsFormSelect>
  </div>
</template>
<script>
import { ConditionHandlerBase } from '@/resources/components/Condition/components/base-condition-handler.js';
export default {
  name: '',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  extends: ConditionHandlerBase,
  inheritAttrs: false,
  props: {
    disabled: { type: Boolean }
  },
  data() {
    return {};
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
<style lang="less"></style>
