export default {
  name: 'FormSlot',
  functional: true,
  props: {
    name: String,
    row: Object,
    index: Number,
    column: {
      type: Object,
      default: null
    }
  },
  render: (h, ctx) => {
    if (ctx.parent.$scopedSlots['_label']) {
      //通过卡槽渲染
      return h('span', ctx.parent.$scopedSlots['_label']());
    } else if (ctx.parent.$parent.$scopedSlots[ctx.parent.name + '-label']) {
      //通过卡槽渲染
      return h('span', ctx.parent.$parent.$scopedSlots[ctx.parent.name + '-label']());
    } else {
      //通过数据渲染
      return h('span', { domProps: { innerHTML: ctx.parent.label } });
    }
  }
};
