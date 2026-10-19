<template>
  <span style="display: inline-flex; position: relative; width: 9em; white-space: nowrap; vertical-align: middle">
    <span data-param-text-prefix>{{ prefix }}</span>
    <!-- 仅省略号触发全文提示，前缀保持普通只读文字，浮层不受表格裁切影响。 -->
    <Tooltip
      v-if="truncated"
      :content="text"
      :transfer="true"
      placement="top"
    >
      <span class="cursor-pointer" data-param-text-ellipsis>...</span>
    </Tooltip>
    <span
      ref="measure"
      aria-hidden="true"
      style="position: absolute; visibility: hidden; pointer-events: none; white-space: pre; width: max-content; left: 0; top: 0"
    ></span>
  </span>
</template>
<script>
export default {
  name: 'ParamText',
  props: {value: {type: [String, Number], default: ''}},
  data() {
    return {prefix: '', truncated: false};
  },
  mounted() {
    this.updateText();
    // 容器字体或窗口尺寸变化时重新测量，不对保存值做任何截断。
    if (typeof ResizeObserver !== 'undefined') {
      this.textObserver = new ResizeObserver(this.updateText);
      this.textObserver.observe(this.$el);
    }
    window.addEventListener('resize', this.updateText);
  },
  beforeDestroy() {
    if (this.textObserver) this.textObserver.disconnect();
    window.removeEventListener('resize', this.updateText);
  },
  methods: {
    measureText(value) {
      // 复用当前元素的实际字体测宽，英文、中文和组合字符按真实占用宽度处理。
      const measure = this.$refs.measure;
      measure.textContent = value;
      const width = measure.getBoundingClientRect().width;
      measure.textContent = '';
      return width;
    },
    updateText() {
      if (this._isDestroyed || !this.$refs.measure) return;
      const fontSize = parseFloat(window.getComputedStyle(this.$el).fontSize) || 13;
      const limit = fontSize * 8;
      this.truncated = this.measureText(this.text) > limit;
      if (!this.truncated) {
        this.prefix = this.text;
        return;
      }
      // 按完整字符边界取最长前缀，避免截断代理对、组合符和 emoji 序列。
      const characters = typeof Intl.Segmenter === 'function'
        ? Array.from(new Intl.Segmenter(undefined, {granularity: 'grapheme'}).segment(this.text), item => item.segment)
        : Array.from(this.text);
      const prefixLimit = Math.min(limit, fontSize * 9 - this.measureText('...'));
      let start = 0;
      let end = characters.length;
      while (start < end) {
        const middle = Math.ceil((start + end) / 2);
        if (this.measureText(characters.slice(0, middle).join('')) <= prefixLimit) start = middle;
        else end = middle - 1;
      }
      this.prefix = characters.slice(0, start).join('');
    }
  },
  computed: {
    text() { return this.value == null ? '' : String(this.value); }
  },
  watch: {
    text() { this.$nextTick(this.updateText); }
  }
};
</script>
