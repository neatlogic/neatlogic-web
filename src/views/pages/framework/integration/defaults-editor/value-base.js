// 所有类型编辑器通过同一事件返回值，避免直接改动参数配置或处理器定义。
export default {
  props: {
    value: { default: undefined },
    schema: { type: Object, default: () => ({}) },
    disabled: { type: Boolean, default: false },
    path: { type: String, default: '' }
  },
  methods: {
    updateValue(value) {
      if (!this.disabled) this.$emit('change', value);
    }
  }
};
