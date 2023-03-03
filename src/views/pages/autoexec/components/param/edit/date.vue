<template>
  <TsFormDatePicker
    ref="item"
    :value="value"
    :readonly="readonly"
    :disabled="disabled"
    transfer
    v-bind="getSetting"
    width="100%"
    border="border"
    @on-change="updateval"
  ></TsFormDatePicker>
</template>
<script>
import comMixin from './editmixin.js';
import TsFormDatePicker from '@/resources/plugins/TsForm/TsFormDatePicker';
export default {
  name: '',
  components: {
    TsFormDatePicker
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
