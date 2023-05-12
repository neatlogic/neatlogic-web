
<template>
  <TsFormDatePicker
    ref="item"
    :value="value"
    transfer
    v-bind="getSetting"
    valueType="format"
    width="100%"
    type="datetime"
    format="yyyy-MM-dd HH:mm:ss"
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
  props: {},
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
