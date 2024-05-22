<template>
  <TsFormInput
    ref="item"
    :value="value"
    :readonly="readonly"
    :disabled="disabled"
    v-bind="config"
    border="border"
    @on-change="updateval"
  ></TsFormInput>
</template>

<script>
export default {
  name: '',
  components: {
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: {
      type: String,
      default: ''
    },
    readonly: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    config: {
      type: Object,
      default: function() {
        return {};
      }
    }
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
  computed: {},
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
