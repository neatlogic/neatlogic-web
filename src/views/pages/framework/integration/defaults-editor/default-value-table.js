import TsTable from '@/resources/components/TsTable/TsTable.vue';
import THead from '@/resources/components/TsTable/component/table-thead.vue';
import ParamText from './param-text.vue';

const reservedKeys = ['selection', 'expander', 'action'];

// 仅为集成默认值表格补充表头插槽，正文、行尾悬浮操作和滚动仍复用公共表格。
export const DefaultValueTableHead = {
  name: 'DefaultValueTableHead',
  functional: true,
  props: THead.props,
  render(h, context) {
    const scopedSlots = { ...context.scopedSlots };
    (context.props.list || []).forEach(header => {
      if (reservedKeys.includes(header.key)) return;
      scopedSlots[`th-${header.key}`] = () => h('span', {
        class: { 'require-label': header.isRequired },
        style: { display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap', fontSize: 'inherit' },
        on: {
          click(event) {
            event.stopPropagation();
            if (typeof header.click === 'function') header.click(header);
          }
        }
      }, header.key === 'isRequired' && header.width <= 72
        // 固定短标题无需 9em 容器，避免“必填”窄列产生额外横向溢出。
        ? [header.title]
        : [h(ParamText, { props: { value: header.title }, style: { flexShrink: 0, fontSize: 'inherit' } })]);
    });
    // 函数式代理不增加组件层级，公共表格通过 ref 更新表头滚动位置的行为保持不变。
    return h(THead, { ...context.data, props: context.props, scopedSlots }, context.children);
  }
};

export default {
  name: 'DefaultValueTable',
  extends: TsTable,
  components: { THead: DefaultValueTableHead },
  // 只为公共根节点叠加局部尺寸，公共模板、ref 和静态渲染函数继续复用。
  staticRenderFns: TsTable.staticRenderFns || [],
  render(h) {
    const node = TsTable.render.call(this, h);
    node.data = node.data || {};
    node.data.style = [node.data.style, {
      width: `${this.defaultTableWidth}px`, maxWidth: '100%', minWidth: '0', marginLeft: '0', marginRight: '0'
    }];
    return node;
  },
  data() {
    return { defaultControlFontSize: 14, defaultCellPadding: 18 };
  },
  mounted() {
    // 继承公共组件编译后的 render 和静态渲染函数，不复制模板或改动公共组件。
    this.$nextTick(this.measureDefaultColumns);
    if (typeof ResizeObserver !== 'undefined') {
      this.defaultColumnsObserver = new ResizeObserver(this.measureDefaultColumns);
      this.defaultColumnsObserver.observe(this.$el);
    }
    window.addEventListener('resize', this.measureDefaultColumns);
  },
  updated() {
    this.measureDefaultColumns();
    this.$nextTick(this.syncDefaultTableViewport);
  },
  beforeDestroy() {
    if (this.defaultColumnsObserver) this.defaultColumnsObserver.disconnect();
    window.removeEventListener('resize', this.measureDefaultColumns);
  },
  methods: {
    measureDefaultColumns() {
      if (!this.$el || this._isDestroyed) return;
      const control = this.$el.querySelector('[data-default-control-width]');
      const cell = control && control.closest('td');
      if (control) {
        const fontSize = parseFloat(window.getComputedStyle(control).fontSize);
        if (fontSize > 0 && fontSize !== this.defaultControlFontSize) this.defaultControlFontSize = fontSize;
        // 字体变化会改变 9em 容器尺寸，即使外层宽度不变也会触发重新测量。
        if (this.defaultColumnsObserver && this.defaultObservedControl !== control) {
          if (this.defaultObservedControl) this.defaultColumnsObserver.unobserve(this.defaultObservedControl);
          this.defaultColumnsObserver.observe(control);
          this.defaultObservedControl = control;
        }
      }
      if (cell) {
        const style = window.getComputedStyle(cell);
        const padding = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
        if (padding !== this.defaultCellPadding) this.defaultCellPadding = padding;
      }
      this.$nextTick(this.syncDefaultTableViewport);
    },
    syncDefaultTableViewport() {
      if (this._isDestroyed) return;
      const main = this.$refs.tablemain;
      if (main) {
        // 列减少或窗口变宽后同步真实滚动位置，悬浮栏不能沿用已越界的旧偏移。
        const left = Math.max(0, Math.min(main.scrollLeft, main.scrollWidth - main.clientWidth));
        if (main.scrollLeft !== left) main.scrollLeft = left;
        if (this.scrollLeft !== left) this.scrollLeft = left;
        if (this.$refs.theadRef) this.$refs.theadRef.scrollLeft = left;
        if (this.$refs.tbodyRef) this.$refs.tbodyRef.scrollLeft = left;
      }
      if (typeof this.setWidth === 'function') this.setWidth();
    }
  },
  computed: {
    colsList() {
      // 业务列按 9em 控件与既有留白计算，不让长标题或剩余空间改变控件宽度。
      const columns = [];
      if (this.columnList && this.columnList.length) columns.push({ key: 'columnWidth', width: 24 });
      if (this.canDrag) columns.push({ key: 'dragWidth', width: 30 });
      (this.thList || []).filter(header => header.isShow !== false).forEach(header => {
        const requiredSpace = header.isRequired ? 10 : 0;
        const width = reservedKeys.includes(header.key)
          ? (header.width || (header.key === 'selection' ? 40 : 24))
          : (header.width || Math.ceil(this.defaultControlFontSize * 9 + this.defaultCellPadding + requiredSpace));
        columns.push({ key: `${header.key}Width`, width });
      });
      const action = columns.find(column => column.key === 'actionWidth');
      if (action) {
        // 少列只补足五项操作栏的最小空间，业务列与 9em 控件不参与拉伸。
        const minimumWidth = 5 * (2 * this.defaultControlFontSize + 32) + 24;
        const totalWidth = columns.reduce((total, column) => total + column.width, 0);
        action.width += Math.max(0, minimumWidth - totalWidth);
      }
      return columns;
    },
    defaultTableWidth() {
      return Math.max(1, this.colsList.reduce((total, column) => total + column.width, 0));
    },
    setLayout() {
      // 覆盖公共样式的 min-width:100%，根背景按内容收紧，超宽时仍在表格内部滚动。
      return { tableLayout: 'fixed', width: `${this.defaultTableWidth}px`, minWidth: '0' };
    }
  }
};
