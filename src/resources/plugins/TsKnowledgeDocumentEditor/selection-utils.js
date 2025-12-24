
/**
 * 文案是否被选中，用于判断选中文案的浮动菜单是否显示的条件
 * @param {Editor} editor
 * @returns {object} 
 * { 
 *  hasTextSelection: boolean, // 是否选中了文案
 *  selectedText: string // 选中的文案
 * }
 */
import { TextSelection, NodeSelection} from 'prosemirror-state';
import { CellSelection, findTable } from 'prosemirror-tables';

export function getSelectedTextInfo(editor) {
  const { selection, doc } = editor.state;

  if (!(selection instanceof TextSelection)) return false;
  if (selection.from === selection.to) return false;

  let hasTextSelection = false;
  let selectedText = '';
  doc.nodesBetween(selection.from, selection.to, node => {
    if (node.isText && node.text?.trim()) {
      hasTextSelection = true;
      selectedText += node.text;
      return false;
    }
  });

  return {
    hasTextSelection: hasTextSelection,
    selectedText: selectedText
  };
}

// 获取选中的节点
export function getSelectionNode(editor) {
  const { selection } = editor.state;

  // 处理图片
  if (selection instanceof NodeSelection) {
    return {
      node: selection.node,
      type: selection.node.type.name,
      attrs: selection.node.attrs
    };
  }
  // 处理表格
  if (selection instanceof CellSelection) {
    const table = findTable(selection.$anchorCell);
    return {
      node: table.node,
      type: table.node.type.name,
      attrs: table.node.attrs
    };
  }

  // 处理普通文本/block光标所在节点
  if (selection instanceof TextSelection) {
    const { $from } = selection;
    for (let depth = $from.depth; depth > 0; depth--) {
      const node = $from.node(depth);
      if (node.isBlock) {
        return {
          node: node,
          type: node.type.name,
          attrs: node.attrs
        };
      }
    }
  }

  return null;
}
