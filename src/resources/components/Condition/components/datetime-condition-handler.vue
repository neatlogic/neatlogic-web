<template>
  <div>
    <TsFormDatePicker
      v-bind="$attrs"
      :transfer="true"
      type="datetimerange"
      :value="value"
      @on-change="changeValue"
    ></TsFormDatePicker>
  </div>
</template>
<script>
import { ConditionHandlerBase } from '@/resources/components/Condition/components/base-condition-handler.js';
export default {
  name: '',
  components: {
    TsFormDatePicker: () => import('@/resources/plugins/TsForm/TsFormDatePicker')
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
