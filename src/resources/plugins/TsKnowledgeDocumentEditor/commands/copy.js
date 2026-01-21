import { TextSelection } from 'prosemirror-state';

export default function copy({ editor, position }) {
  const { startPosition } = position || {};
  const { view } = editor;
  const { state } = view;

  if (startPosition == null) return;

  const $pos = state.doc.resolve(startPosition);

  // 1️⃣ 向上找到最近的 listItem
  let itemDepth = null;
  let listItemNode = null;

  for (let d = $pos.depth; d > 0; d--) {
    const node = $pos.node(d);
    if (node.type.name === 'listItem') {
      itemDepth = d;
      listItemNode = node;
      break;
    }
  }

  // 2️⃣ 如果在列表中，只复制当前这一行
  let from;
  let to;

  if (itemDepth != null && listItemNode) {
    from = $pos.start(itemDepth);
    to = from + listItemNode.nodeSize;
  } else {
    // 非列表：复制当前 block
    const depth = $pos.depth;
    const node = $pos.node(depth);

    from = $pos.start(depth);
    to = from + node.nodeSize;
  }

  // 3️⃣ 使用 TextSelection（关键）
  const tr = state.tr.setSelection(
    TextSelection.create(state.doc, from, to)
  );

  view.focus();
  view.dispatch(tr);

  // 4️⃣ 触发浏览器复制
  document.execCommand('copy');
}
