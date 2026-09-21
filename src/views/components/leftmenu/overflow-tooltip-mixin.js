export default {
  data() {
    return {
      overflowTooltipMap: {},
      overflowTooltipResizeObserver: null,
      overflowTooltipPending: false
    };
  },
  mounted() {
    this.$el.setAttribute('data-overflow-tooltip-scope', '');
    this.refreshOverflowTooltips();
    if (typeof ResizeObserver !== 'undefined') {
      this.overflowTooltipResizeObserver = new ResizeObserver(() => {
        this.refreshOverflowTooltips();
      });
      this.overflowTooltipResizeObserver.observe(this.$el);
    } else {
      window.addEventListener('resize', this.refreshOverflowTooltips);
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.refreshOverflowTooltips);
    if (this.overflowTooltipResizeObserver) {
      this.overflowTooltipResizeObserver.disconnect();
      this.overflowTooltipResizeObserver = null;
    }
  },
  methods: {
    isOverflowTooltip(key) {
      return !!this.overflowTooltipMap[key];
    },
    refreshOverflowTooltips() {
      if (this.overflowTooltipPending) {
        return;
      }
      this.overflowTooltipPending = true;
      this.$nextTick(() => {
        this.overflowTooltipPending = false;
        if (!this.$el) {
          return;
        }
        const overflowTooltipMap = {};
        const elementList = Array.from(this.$el.querySelectorAll('[data-overflow-tooltip-key]')).filter(element => {
          let parentElement = element.parentElement;
          while (parentElement && parentElement !== this.$el) {
            if (parentElement.hasAttribute('data-overflow-tooltip-scope')) {
              return false;
            }
            parentElement = parentElement.parentElement;
          }
          return parentElement === this.$el;
        });
        elementList.forEach(element => {
          const key = element.getAttribute('data-overflow-tooltip-key');
          overflowTooltipMap[key] = element.scrollWidth > element.clientWidth;
        });
        const oldKeyList = Object.keys(this.overflowTooltipMap);
        const newKeyList = Object.keys(overflowTooltipMap);
        const isChanged = oldKeyList.length !== newKeyList.length || newKeyList.some(key => this.overflowTooltipMap[key] !== overflowTooltipMap[key]);
        if (isChanged) {
          this.overflowTooltipMap = overflowTooltipMap;
        }
      });
    }
  }
};
