import { TextSelection } from 'prosemirror-state';
export default function link({ editor, position, options }) {
  const { linkUrl = '', linkText = '', operationType = '' } = options || {};
  const { startPosition, endPosition, insertPosition } = position || {};
  
  if (operationType == 'addLink') {
    // 空白行插入链接
    addLink(editor, insertPosition, linkUrl, linkText);
  } else if (operationType == 'replaceLink') {
    // 选中文案，插入链接
    resetLinkOnText(editor, startPosition, endPosition, linkUrl);
  } else if (operationType == 'removeLink') {
    // 移除超链接
    removeLink(editor, startPosition, endPosition);
  }
}

function resetLinkOnText(editor, from, to, href) {
  // 选中文本，插入链接
  const { state, view } = editor;
  const linkType = state.schema.marks.link;
  if (!linkType || from >= to) return;

  let tr = state.tr.setSelection(
    TextSelection.create(state.doc, from, to)
  );

  tr = tr.removeMark(from, to, linkType);

  const linkMark = linkType.create({ href });
  tr = tr.addMark(from, to, linkMark);

  view.dispatch(tr);
  view.dom.blur();
}

function addLink(editor, insertPosition, linkUrl, linkText) {
  // 空白行插入链接
  editor.chain().focus().insertContentAt(insertPosition, [
    {
      type: 'text',
      text: linkText,
      marks: [
        {
          type: 'link',
          attrs: { href: linkUrl }
        }
      ]
    }
  ]
  ).run();
}

function removeLink(editor, startPosition, endPosition) {
  // 移除超链接
  const { state } = editor;
  const tr = state.tr.removeMark(
    startPosition,
    endPosition,
    state.schema.marks.link
  );
  editor.view.dispatch(tr);
}

