export default {
  name: 'NodeRight',
  functional: true,
  props: ['treeComponent', 'rootNode', 'parentNode', 'node', 'index', 'nodeList', 'level', 'path'],
  render(h, {data, props}) {
    const treeComponent = props.treeComponent;
    if (treeComponent.$scopedSlots.right) {
      return h('div', data, treeComponent.$scopedSlots.right(props));
    }
    return null;
  }
};
