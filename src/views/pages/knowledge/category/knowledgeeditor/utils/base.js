import InsertMenuCommands from '@/views/pages/knowledge/category/knowledgeeditor/commands/index.js';
import { getCellSelectionByIndex } from '@/views/pages/knowledge/category/knowledgeeditor/commands/table/utils.js';

function runMenuCommand(vm, { editor, menuData, position }) {
  if (!editor || editor.isDestroyed || !menuData) {
    return;
  }
  if (!getEditorView(editor)) {
    return;
  }
  const { commandName, options = {} } = menuData;
  const commandMethod = InsertMenuCommands[commandName];
  if (!commandMethod) {
    return;
  }
  getCellSelectionByIndex({ editor, options });
  commandMethod({
    editor,
    position,
    options,
    https: vm.$https,
    _this: vm
  });
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

export default {
  methods: {
    handleSelectMenuContent({ editor, menuData, hoverBlockDom }) {
      runMenuCommand(this, {
        editor,
        menuData,
        position: this.findInsertContentPosition({ editor, hoverBlockDom })
      });
    },

    findInsertContentPosition({ editor, hoverBlockDom }) {
      const view = getEditorView(editor);
      const { state } = editor || {};
      const { doc, selection } = state || {};
      if (!view || !doc) {
        return {};
      }

      const coords = hoverBlockDom?.getBoundingClientRect();
      // 空白行或选择区菜单使用鼠标所在块的坐标换算文档位置，作为新内容的插入锚点
      const found = coords ? view.posAtCoords({ left: coords.left, top: coords.top }) : null;
      const position = found?.pos ?? selection?.from ?? 0;
      const safePosition = Math.max(0, Math.min(position, doc.content.size));
      const $pos = doc.resolve(safePosition);

      return {
        insertPosition: safePosition,
        startPosition: $pos.start($pos.depth),
        endPosition: $pos.end($pos.depth)
      };
    },

    findCurrentBlockPosition({ editor, hoverBlockDom }) {
      const view = getEditorView(editor);
      const { state } = editor || {};
      const { doc, selection } = state || {};
      if (!view || !doc) {
        return {};
      }

      const docSize = doc.content.size;
      const coords = hoverBlockDom?.getBoundingClientRect();
      const posResult = coords ? view.posAtCoords({ left: coords.left, top: coords.top }) : null;
      const pos = posResult?.pos;
      const directNode = pos != null ? doc.nodeAt(pos) : null;
      const atomBlockList = ['image', 'video', 'file', 'horizontalRule'];

      // 图片、视频、分割线这类原子块没有可编辑正文，需直接定位到节点结束处，避免在下方插入时越界
      if (directNode && directNode.type.isBlock && atomBlockList.includes(directNode.type.name)) {
        const nodeStart = pos;
        const nodeEnd = pos + directNode.nodeSize;
        return {
          node: directNode,
          startPosition: nodeStart,
          endPosition: nodeEnd,
          insertPosition: Math.min(nodeEnd, docSize)
        };
      }

      const position = pos != null ? doc.resolve(pos) : selection.$from;
      let node = null;
      let nodeStart = null;
      let nodeEnd = null;
      // 从命中位置向外查找最近的块节点，用于替换当前行和“在下方插入”
      for (let depth = position.depth; depth > 0; depth--) {
        const tempNode = position.node(depth);
        if (tempNode.type.isBlock) {
          node = tempNode;
          nodeStart = position.before(depth);
          nodeEnd = nodeStart + node.nodeSize;
          break;
        }
      }

      return {
        node,
        startPosition: nodeStart,
        endPosition: nodeEnd,
        insertPosition: Math.min(nodeEnd || docSize, docSize)
      };
    },

    handleInsertBelowPosition({ editor, menuData, hoverBlockDom }) {
      runMenuCommand(this, {
        editor,
        menuData,
        position: this.findCurrentBlockPosition({ editor, hoverBlockDom })
      });
    },

    handleInsertMenuContent({ editor, menuData, hoverBlockDom }) {
      runMenuCommand(this, {
        editor,
        menuData,
        position: this.findInsertContentPosition({ editor, hoverBlockDom })
      });
    },

    handleReplaceMenuContent({ editor, menuData, hoverBlockDom }) {
      const position = this.findCurrentBlockPosition({ editor, hoverBlockDom });
      runMenuCommand(this, {
        editor,
        menuData: {
          ...menuData,
          options: {
            ...(menuData?.options || {}),
            isToggle: true
          }
        },
        position
      });
    },

    transformBlockType({ editor, position = {}, nodeType, nodeAttrs = {} } = {}) {
      const { node, startPosition, endPosition } = position || {};
      if (!editor || !node || startPosition == null || endPosition == null) {
        return;
      }
      const nodeTextContent = node.textContent;
      if (nodeTextContent) {
        const view = getEditorView(editor);
        if (!view) {
          return;
        }
        const { schema } = view.state;
        const newNode = schema.nodes[nodeType].create(nodeAttrs, schema.text(nodeTextContent));
        view.dispatch(editor.state.tr.replaceWith(startPosition, endPosition, newNode));
      }
    },

    getTableNode({ editor, event }) {
      const view = getEditorView(editor);
      const posResult = view?.posAtCoords({ left: event.clientX, top: event.clientY });
      if (!posResult) {
        return null;
      }
      const $pos = editor?.state?.doc?.resolve(posResult.pos);
      for (let depth = $pos.depth; depth > 0; depth--) {
        const node = $pos.node(depth);
        if (node.type.name === 'table') {
          return {
            nodeType: node.type?.name,
            attrs: node.attrs
          };
        }
      }
      return null;
    },

    findTableNodeByUuid({ editor, uuid }) {
      let result = null;
      editor?.state?.doc?.descendants((node) => {
        if (node.type.name === 'table' && node.attrs?.blockUuid === uuid) {
          result = {
            nodeType: node.type?.name,
            attrs: node.attrs
          };
          return false;
        }
      });
      return result;
    }
  }
};
