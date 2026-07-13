export const ConditionHandlerBase = {
  props: {
    value: { type: [String, Number, Boolean, Object, Array] }
  },
  data() {
    return {};
  },
  methods: {
    changeValue() {
      this.$emit('change', ...arguments);
    }
  },
  beforeDestroy() {},
  watch: {}
};
