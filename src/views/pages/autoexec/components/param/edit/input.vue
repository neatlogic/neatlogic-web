<template>
  <TsFormInput
    ref="item"
    :value="value"
    :readonly="readonly"
    :disabled="disabled"
    v-bind="getSetting"
    border="border"
    @on-change="updateval"
  ></TsFormInput>
</template>

<script>
import comMixin from './editmixin.js';
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
export default {
  name: '',
  components: {
    TsFormInput
  },
  mixins: [comMixin],
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    // value: [String, Number]
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

  methods: {
    updateval(val) {
      this.$emit('change', val);
    }
  },

  filter: {},

  computed: {
  },

  watch: {}
};
</script>
<style lang="less" scoped>
/deep/ .tsform-input-readonly {
  opacity: 1;
  cursor: text;
  .tsform-readonly {
    cursor: text;
  }
}
</style>
