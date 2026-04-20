import { TextSelection } from 'prosemirror-state';
import { getKnowledgeLinkClass } from '../utils/link-utils.js';

export default function link({ editor, position, options }) {
  const view = getEditorView(editor);
  if (!view) {
    return;
  }
  const { linkUrl = '', linkText = '', operationType = '', target = '_blank', linkType = 'outer' } = options || {};
  const { startPosition, endPosition, insertPosition } = position || {};
  const selection = editor?.state?.selection || {};
  const range = getCommandRange({
    options,
    position: {
      startPosition,
      endPosition
    },
    selection
  });
  const linkAttrs = getLinkAttrs(normalizeLinkUrl(linkUrl), target, linkType);

  if (operationType === 'addLink') {
    // 空白行新增链接组件时，默认按外链处理，写入显示文案和链接配置。
    addLink(editor, insertPosition, linkAttrs, linkText);
  } else if (operationType === 'replaceLink') {
    // 选中文本设置或修改链接时只替换 mark，不改文本内容。
    resetLinkOnText(editor, range.startPosition, range.endPosition, linkAttrs);
  } else if (operationType === 'removeLink') {
    // 移除当前文本范围上的链接 mark。
    removeLink(editor, range.startPosition, range.endPosition);
  }
}

function getCommandRange({ options = {}, position = {}, selection = {} }) {
  if (options.startPosition != null && options.endPosition != null) {
    return {
      startPosition: options.startPosition,
      endPosition: options.endPosition
    };
  }
  if (selection.from != null && selection.to != null && selection.from !== selection.to) {
    return {
      startPosition: selection.from,
      endPosition: selection.to
    };
  }
  return position;
}

function normalizeLinkUrl(url) {
  const trimmedUrl = String(url || '').trim();
  if (!trimmedUrl) return '';
  if (/^(https?:\/\/|mailto:|tel:|#|\/)/i.test(trimmedUrl)) {
    return trimmedUrl;
  }
  return `http://${trimmedUrl}`;
}

function getLinkAttrs(href, target = '_blank', linkType = 'outer') {
  return {
    href,
    target: target || '_blank',
    rel: target === '_blank' ? 'noopener noreferrer' : null,
    class: getKnowledgeLinkClass(linkType)
  };
}

function resetLinkOnText(editor, from, to, linkAttrs) {
  if (!linkAttrs.href) return;
  const view = getEditorView(editor);
  if (!view) return;
  const { state } = editor;
  const linkType = state.schema.marks.link;
  if (!linkType || from >= to) return;

  let tr = state.tr.setSelection(
    TextSelection.create(state.doc, from, to)
  );

  tr = tr.removeMark(from, to, linkType);
  tr = tr.addMark(from, to, linkType.create(linkAttrs));

  view.dispatch(tr);
  view.dom && view.dom.blur();
}

function addLink(editor, insertPosition, linkAttrs, linkText) {
  if (!linkAttrs.href || insertPosition == null) return;
  editor.chain().focus().insertContentAt(insertPosition, [
    {
      type: 'text',
      text: linkText || linkAttrs.href,
      marks: [
        {
          type: 'link',
          attrs: linkAttrs
        }
      ]
    }
  ]).run();
}

function removeLink(editor, startPosition, endPosition) {
  const view = getEditorView(editor);
  if (!view) return;
  const { state } = editor;
  const linkType = state.schema.marks.link;
  if (!linkType || startPosition == null || endPosition == null || startPosition >= endPosition) return;
  const tr = state.tr.removeMark(startPosition, endPosition, linkType);
  view.dispatch(tr);
}

function getEditorView(editor) {
  if (!editor || editor.isDestroyed) {
    return null;
  }
  try {
    return editor.view || null;
  } catch (error) {
    return null;
  }
}
