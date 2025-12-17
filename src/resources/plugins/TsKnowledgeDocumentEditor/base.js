import InsertMenuCommands from '@/resources/plugins/TsKnowledgeDocumentEditor/commands/index.js';
export default {
  methods: {
    executeEditorCommand({menuData, _this}) {
      if (!_this.editor) return;
      const insertPos = _this.findInsertContentPosition();
      const { commandName, value = {} } = menuData;
      const commandMethod = InsertMenuCommands[commandName];
      if (commandMethod) {
        commandMethod({
          editor: _this.editor,
          position: insertPos,
          options: value,
          https: _this.$https,
          _this: _this
        });
      }
    },
    findInsertContentPosition() {
      const view = this.editor.view;
      const coords = this.currentBlock?.getBoundingClientRect();
      const found = coords
        ? view.posAtCoords({
          left: coords.left,
          top: coords.top
        })
        : null;

      let position = found?.pos ?? this.editor.state.selection.from;
      const { doc } = this.editor.state;
      const $pos = doc.resolve(position);

      const nodeAfter = $pos.nodeAfter;
      const nodeBefore = $pos.nodeBefore;

      // 情况1：命中的是 atom block 的前面
      if (nodeAfter && nodeAfter.type.isAtom && nodeAfter.isBlock) {
        return position + nodeAfter.nodeSize; // 跳到节点之后
      }

      // 情况2：命中的是 atom block 的后面
      if (nodeBefore && nodeBefore.type.isAtom && nodeBefore.isBlock) {
        return position; // 已经在节点后面，无需处理
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
      return {
        insertPosition: position
      };
    },
    findCurrentBlockPosition() {
      // 获取当前块元素的位置（编辑菜单编辑器悬停的位置）
      const { view, state } = this.editor;
      let posResult = null;
      let $pos;
      let node, nodeStart, nodeEnd;
      if (this.currentBlock) {
        const coords = this.currentBlock.getBoundingClientRect();
        posResult = view.posAtCoords({ left: coords.left, top: coords.top });
      }
      if (posResult?.pos != null) {
        $pos = state.doc.resolve(posResult.pos);
      } else {
        const { $from } = state.selection;
        $pos = $from;
      }

      // 2. 找到最近的 block 节点
      for (let depth = $pos.depth; depth > 0; depth--) {
        const tempNode = $pos.node(depth);
        if (tempNode.type.isBlock) {
          node = tempNode;
          nodeStart = $pos.before(depth);
          nodeEnd = nodeStart + node.nodeSize;
          break;
        }
      }
      return {
        node: node,
        startPosition: nodeStart,
        endPosition: nodeEnd,
        insertPosition: nodeEnd + 1
      };
    },
    handleInsertBelowPosition(menuData) {
      // 编辑菜单，在下方插入一行
      if (!this.editor) return;
      const position = this.findCurrentBlockPosition();
      const { commandName, value = {} } = menuData;
      const commandMethod = InsertMenuCommands[commandName];
      if (commandMethod) {
        commandMethod({
          editor: this.editor,
          position: position,
          options: value,
          https: this.$https,
          _this: this
        });
      }
    },
    handleInsertMenuContent(menuData) {
      // 空白行插入菜单
      if (!this.editor) return;
      const position = this.findInsertContentPosition();
      const { commandName, value = {} } = menuData;
      const commandMethod = InsertMenuCommands[commandName];
      if (commandMethod) {
        commandMethod({
          editor: this.editor,
          position: position,
          options: value,
          https: this.$https,
          _this: this
        });
      }
    },
    handleReplaceMenuContent(menuData) {
      // 编辑菜单，替换当前行
      if (!this.editor) return;
      const { commandName, value = {} } = menuData;
      const position = this.findCurrentBlockPosition();
      const commandMethod = InsertMenuCommands[commandName];
      if (commandMethod) {
        commandMethod({
          editor: this.editor,
          position: position || {},
          options: {...value, isToggle: true},
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
      const posResult = editor.view.posAtCoords(coords);

      if (!posResult) {
        // 无法映射到文档位置
        return null; 
      }

      // 映射结果包含 position (pos) 和 insideDOM
      const clickedPos = posResult.pos;
      const $pos = this.editor.state.doc.resolve(clickedPos);
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
    findTableNodeByUuid({editor, uuid}) {
      let result = null;
      const state = editor.state;
      state.doc.descendants((node, pos) => {
        if (
          node.type.name === 'table' &&
      node.attrs?.['data-uuid'] === uuid
        ) {
          result = { nodeType: node?.type?.name, attrs: node?.attrs };
          return false; // 停止遍历
        }
      });
      return result;
    }
  }
};
