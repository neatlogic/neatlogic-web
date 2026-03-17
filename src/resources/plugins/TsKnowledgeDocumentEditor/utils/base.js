import InsertMenuCommands from '@/resources/plugins/TsKnowledgeDocumentEditor/commands/index.js';
import { getCellSelectionByIndex } from '@/resources/plugins/TsKnowledgeDocumentEditor/commands/table/utils.js';
export default {
  methods: {
    // 处理选中的菜单内容，点击菜单后执行的方法
    handleSelectMenuContent({ editor, menuData, hoverBlockDom }) {
      if (!editor) return;
      const insertPos = this.findInsertContentPosition({editor: editor, hoverBlockDom: hoverBlockDom});
      const { commandName, options = {} } = menuData;
      const commandMethod = InsertMenuCommands[commandName];
      if (commandMethod) {
        getCellSelectionByIndex({editor: editor, options: options});
        commandMethod({
          editor: editor,
          position: insertPos,
          options: options,
          https: this.$https,
          _this: this
        });
      }
    },

    // 查找插入内容的位置
    findInsertContentPosition({ editor, hoverBlockDom }) {
      const view = editor?.view;
      const coords = hoverBlockDom?.getBoundingClientRect();
      const found = coords
        ? view.posAtCoords({
          left: coords.left,
          top: coords.top
        })
        : null;

      let position = found?.pos ?? editor?.state?.selection?.from;
      const { doc } = editor?.state || {};
      const $pos = doc.resolve(position);

      const nodeAfter = $pos.nodeAfter;
      const nodeBefore = $pos.nodeBefore;

      // 情况1：命中的是 atom block 的前面
      if (nodeAfter && nodeAfter.type.isAtom && nodeAfter.isBlock) {
        position = position + nodeAfter.nodeSize;
      }

      // 情况2：命中的是 atom block 的后面
      if (nodeBefore && nodeBefore.type.isAtom && nodeBefore.isBlock) {
        // position 本身就是安全的
      }

      // 非 atom block的情况
      for (let d = $pos.depth; d > 0; d--) {
        const node = $pos.node(d);
        const parent = $pos.node(d - 1);

        // 处理无序有序列表时，需要跳到列表后面
        if (node.isBlock && parent.type === doc.type) {
          // return $pos.after(d);
        }
      }
    
      // === 只新增的部分（重点） ===
      const $finalPos = doc.resolve(position);
      const from = $finalPos.start($finalPos.depth);
      const to = $finalPos.end($finalPos.depth);
    
      return {
        insertPosition: position,
        startPosition: from,
        endPosition: to
      };
    },

    // 获取当前鼠标悬停快的位置(编辑菜单编辑器悬停的位置)
    findCurrentBlockPosition({ editor, hoverBlockDom }) {
      const { view, state } = editor || {};
      let posResult = null;
      if (hoverBlockDom) {
        const coords = hoverBlockDom.getBoundingClientRect();
        posResult = view.posAtCoords({ left: coords.left, top: coords.top });
      }
      const pos = posResult?.pos;
      const node = pos ? state.doc.nodeAt(pos) : '';

      const blockList = ['image', 'insertVideo', 'horizontalRule'];
      
      if (node && node.type.isBlock && blockList.includes(node.type.name)) {
        // 图片拿到depth是0，所以需要单独处理
        const nodeStart = pos;
        const nodeEnd = pos + node.nodeSize;

        return {
          node: node,
          startPosition: nodeStart,
          endPosition: nodeEnd,
          insertPosition: nodeEnd + 1
        };
      } else {
        let node = null;
        let nodeStart = null;
        let nodeEnd = null;
        let position = null;
        if (pos != null) {
          position = state.doc.resolve(pos);
        } else {
          const { $from } = state.selection;
          position = $from;
        }
  
        // 2. 找到最近的 block 节点
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
          node: node,
          startPosition: nodeStart,
          endPosition: nodeEnd,
          insertPosition: nodeEnd + 1 // 下一个节点内部的开头
        };
      }
    },
    handleInsertBelowPosition({ editor, menuData, hoverBlockDom }) {
      // 编辑菜单，在下方插入一行
      if (!editor) return;
      const position = this.findCurrentBlockPosition({editor: editor, hoverBlockDom: hoverBlockDom});
      const { commandName, options = {} } = menuData;
      const commandMethod = InsertMenuCommands[commandName];
      if (commandMethod) {
        getCellSelectionByIndex({editor: editor, options: options});
        commandMethod({
          editor: editor,
          position: position,
          options: options,
          https: this.$https,
          _this: this
        });
      }
    },
    handleInsertMenuContent({ editor, menuData, hoverBlockDom }) {
      // 空白行插入菜单
      if (!editor) return;
      const position = this.findInsertContentPosition({editor: editor, hoverBlockDom: hoverBlockDom});
      const { commandName, options = {} } = menuData;
      const commandMethod = InsertMenuCommands[commandName];
      if (commandMethod) {
        getCellSelectionByIndex({editor: editor, options: options});
        commandMethod({
          editor: editor,
          position: position,
          options: options,
          https: this.$https,
          _this: this
        });
      }
    },
    handleReplaceMenuContent({editor, menuData, hoverBlockDom}) {
      // 编辑菜单，替换当前行
      if (!editor) return;
      const { commandName, options = {} } = menuData;
      const position = this.findCurrentBlockPosition({editor: editor, hoverBlockDom: hoverBlockDom});
      const commandMethod = InsertMenuCommands[commandName];
      if (commandMethod) {
        const tempOptions = {...options, isToggle: true};
        getCellSelectionByIndex({editor: editor, options: tempOptions});
        commandMethod({
          editor: editor,
          position: position || {},
          options: tempOptions,
          https: this.$https,
          _this: this
        });
      }
    },
    transformBlockType({editor, position = {}, nodeType, nodeAttrs = {}} = {}) {
      // 替换当前节点为指定类型的节点
      const { node, startPosition, endPosition } = position || {};
      if (!node) return;
      const nodeTextContent = node.textContent;
      if (node && nodeTextContent) {
        const { schema } = editor.view.state;
        const newNode = editor.view.state.schema.nodes[nodeType].create(nodeAttrs, schema.text(nodeTextContent));
        editor.view.dispatch(editor.state.tr.replaceWith(startPosition, endPosition, newNode));
      }
    },
    getTableNode({editor, event}) {
      // 获取表格节点
      const { clientX, clientY } = event;
      const coords = { left: clientX, top: clientY };
      const posResult = editor?.view?.posAtCoords(coords);

      if (!posResult) {
        // 无法映射到文档位置
        return null; 
      }

      // 映射结果包含 position (pos) 和 insideDOM
      const clickedPos = posResult.pos;
      const $pos = editor?.state?.doc?.resolve(clickedPos);
      for (let d = $pos.depth; d > 0; d--) {
        const node = $pos.node(d);

        if (node.type.name === 'table') {
          const tableNode = node;
          const tableAttrs = tableNode.attrs;
          const tableType = tableNode.type?.name;

          // 返回表格节点和属性
          return { nodeType: tableType, attrs: tableAttrs };
        }
      }
      return null; // 没有找到父级表格
    },

    // 根据uuid查找表格节点
    findTableNodeByUuid({editor, uuid}) {
      let result = null;
      const state = editor.state;
      state.doc.descendants((node, pos) => {
        if (node.type.name === 'table' && node.attrs?.blockUuid === uuid) {
          result = {
            nodeType: node?.type?.name,
            attrs: node?.attrs
          };
          return false; // 停止遍历
        }
      });
      return result;
    }
  }
};
