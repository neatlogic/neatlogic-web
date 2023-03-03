
<template>
  <TsFormDatePicker
    ref="item"
    :value="value"
    transfer
    v-bind="getSetting"
    width="100%"
    type="time"
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
