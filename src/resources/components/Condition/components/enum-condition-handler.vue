<template>
  <div>
    <TsFormSelect
      v-bind="$attrs"
      transfer
      border="border"
      :value="value"
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
  },
  data() {
    return {};
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
<style lang="less"></style>
