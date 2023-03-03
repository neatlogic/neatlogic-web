export default {
  name: 'NodeContent',
  functional: true,
  props: ['treeComponent', 'rootNode', 'parentNode', 'node', 'index', 'nodeList', 'level', 'path'],
  render(h, {data, props, children}) {
    const treeComponent = props.treeComponent;
    if (treeComponent.$scopedSlots.default) {
      return h('div', data, treeComponent.$scopedSlots.default(props));
    }
    return h('div', children);
  }
};
