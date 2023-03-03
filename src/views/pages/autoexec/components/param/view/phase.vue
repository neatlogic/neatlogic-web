<template>
  <TsFormSelect
    ref="item"
    :value="value"
    :readonly="readonly"
    :disabled="disabled"
    v-bind="getSetting"
    :dataList="phaseList"
    :transfer="true"
    border="border"
    @on-change="updateval"
  ></TsFormSelect>
</template>
<script>
import viewmixin from './viewmixin.js';
export default {
  name: '',
  components: {
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  mixins: [viewmixin],
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {},
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
  methods: {
    updateval(val) {
      this.$emit('change', val);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
