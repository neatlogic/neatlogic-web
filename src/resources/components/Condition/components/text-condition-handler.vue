<template>
  <div>
    <TsFormInput
      border="border"
      :value="value"
      v-bind="$attrs"
      @on-change="changeValue"
    ></TsFormInput>
  </div>
</template>
<script>
import { ConditionHandlerBase } from '@/resources/components/Condition/components/base-condition-handler.js';

export default {
  name: '',
  components: {
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
  },
  extends: ConditionHandlerBase,
  inheritAttrs: false,
  props: {},
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
