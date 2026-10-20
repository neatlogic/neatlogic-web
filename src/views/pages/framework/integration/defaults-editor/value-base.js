// 所有类型编辑器通过同一事件返回值，避免直接改动参数配置或处理器定义。
export default {
  props: {
    value: { default: undefined },
    schema: { type: Object, default: () => ({}) },
    disabled: { type: Boolean, default: false },
    path: { type: String, default: '' },
    // 仅数组默认数据弹窗控制提示时机，其余独立编辑入口仍默认完整显示。
    validationMode: { type: String, default: 'all' }
  },
  data() { return { inputTouched: false }; },
  methods: {
    updateValue(value) {
      if (!this.disabled) {
        this.inputTouched = true;
        this.$emit('change', value);
      }
    },
    readInputValue(fallback = this.value) {
      const input = this.$refs.input;
      if (!input || !Object.prototype.hasOwnProperty.call(input, 'currentValue')) return fallback;
      // 公共文本框会把未设置显示为空串；尚未编辑的空控件不能在确认时被补造成显式空字符串。
      return !this.inputTouched && fallback === undefined && input.currentValue === '' ? undefined : input.currentValue;
    },
    flushInput() {
      if (this.disabled) return;
      const value = this.readInputValue();
      if (!this.inputTouched && value === this.value) return;
      this.updateValue(value);
    },
    blurInput() {
      // 先同步尚在焦点中的控件值，再通知父单元格检查，不能只改变提示而遗漏最后一次输入。
      // 单纯聚焦再失焦不写配置，尤其不能把主表未设置字符串自动变为已启用的空串。
      if (this.inputTouched) this.flushInput();
      this.$emit('blur');
    }
  }
};
