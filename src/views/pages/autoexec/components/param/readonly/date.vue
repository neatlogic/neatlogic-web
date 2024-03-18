
<template>
  <div>
    <template v-if="value && !$utils.isEmpty(value)">
      <TsFormDatePicker
        :value="value"
        v-bind="config"
        :readonly="true"
      ></TsFormDatePicker>
    </template>
    <template v-else>{{ $t('page.notarget', {target: $t('page.defaultvalue')}) }}</template>
  </div>
</template>
<script>
import TsFormDatePicker from '@/resources/plugins/TsForm/TsFormDatePicker';
export default {
  name: '',
  components: {
    TsFormDatePicker
  },
  filters: {},
  props: {
    value: [String, Array, Number],
    config: Object
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

