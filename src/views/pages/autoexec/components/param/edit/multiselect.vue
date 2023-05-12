
<template>
  <TsFormSelect
    ref="multiselect"
    :value="value"
    :readonly="readonly"
    :disabled="disabled"
    transfer
    v-bind="getSetting"
    width="100%"
    border="border"
    @on-change="updateval"
  ></TsFormSelect>
</template>
<script>
import comMixin from './editmixin.js';
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
export default {
  name: '',
  components: {
    TsFormSelect
  },
  filters: {},
  mixins: [comMixin],
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    // value: [String]
  },
  data() {
    return {};
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {},
  computed: {},
  watch: {}
};
</script>
<style lang='less' scoped>
</style>
