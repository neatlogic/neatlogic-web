<template>
  <TsFormSwitch
    ref="item"
    :value="value"
    :readonly="readonly"
    :disabled="disabled"
    :falseValue="false"
    :trueValue="true"
    :trueText="$t('page.yes')"
    :falseText="$t('page.no')"
    @on-change="updateval"
  ></TsFormSwitch>
</template>
<script>
import comMixin from './editmixin.js';
export default {
  name: '',
  components: {
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve)
  },
  mixins: [comMixin],
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: Boolean
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
<style lang="less">
</style>
