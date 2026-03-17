import { TextSelection } from 'prosemirror-state';
import ViewUI from 'neatlogic-ui/iview/index.js';
import { $t } from '@/resources/init.js';

export default function copy({ editor, position, options }) {
  const { startPosition } = position || {};
  if (startPosition == null) return;
  console.log('复制的内容1', options);

  const { view } = editor;
  const { state } = view;
  const { doc } = state;

  if (startPosition < 0 || startPosition > doc.content.size) {
    console.warn('copy: startPosition 越界');
    return;
  }

  const $pos = doc.resolve(startPosition);

  let from;
  let to;

  // 1️⃣ 查找最近 listItem
  let itemDepth = null;

  for (let d = $pos.depth; d > 0; d--) {
    if ($pos.node(d).type.name === 'listItem') {
      itemDepth = d;
      break;
    }
  }

  if (itemDepth != null) {
    from = $pos.before(itemDepth);
    to = $pos.after(itemDepth);
  } else {
    // 2️⃣ 找到最近 block depth（不能是 0）
    let blockDepth = null;

    for (let d = $pos.depth; d > 0; d--) {
      if ($pos.node(d).isBlock) {
        blockDepth = d;
        break;
      }
    }
    console.log('复制的内容2', blockDepth);

    if (blockDepth == null) return;

    from = $pos.before(blockDepth);
    to = $pos.after(blockDepth);
  }

  // 3️⃣ 防御边界
  from = Math.max(0, from);
  to = Math.min(doc.content.size, to);
  console.log('复制的内容3');

  if (from >= to) return;

  const tr = state.tr.setSelection(
    TextSelection.create(doc, from, to)
  );

  view.focus();
  view.dispatch(tr);
  
  document.execCommand('copy');
  ViewUI.Message.success($t('message.copysuccess'));
}
