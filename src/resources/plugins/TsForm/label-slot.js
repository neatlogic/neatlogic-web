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
    const parent = ctx.parent;
    const parentScopedSlots = parent && parent.$scopedSlots ? parent.$scopedSlots : {};
    const upperParent = parent && parent.$parent ? parent.$parent : null;
    const upperScopedSlots = upperParent && upperParent.$scopedSlots ? upperParent.$scopedSlots : {};
    const slotName = parent && parent.name ? parent.name + '-label' : '';

    if (parentScopedSlots['_label']) {
      return h('span', parentScopedSlots['_label']());
    } else if (slotName && upperScopedSlots[slotName]) {
      return h('span', upperScopedSlots[slotName]());
    } else {
      // HTML label 内容需保证来源可信
      return h('span', { domProps: { innerHTML: parent && parent.label ? parent.label : '' } });
    }
  }
};
