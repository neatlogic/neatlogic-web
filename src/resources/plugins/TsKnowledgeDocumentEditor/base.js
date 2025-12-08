import InsertMenuCommands from '@/resources/plugins/TsKnowledgeDocumentEditor/commands/index.js';
export default {
  methods: {
    executeEditorCommand({menuData, currentInstanceThis}) {
      if (!currentInstanceThis.editor) return;
      const insertPos = currentInstanceThis.findInsertContentPosition();
      const { commandName, value = {} } = menuData;
      const commandMethod = InsertMenuCommands[commandName];
      if (commandMethod) {
        commandMethod({
          editor: currentInstanceThis.editor,
          position: insertPos,
          options: value,
          https: currentInstanceThis.$https
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
      return position;
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
        endPosition: nodeEnd
      };
    },
    handleInsertMenuContent(menuData) {
      if (!this.editor) return;
      const position = this.findInsertContentPosition();
      const { commandName, value = {} } = menuData;
      const commandMethod = InsertMenuCommands[commandName];
      if (commandMethod) {
        commandMethod({
          editor: this.editor,
          position: position,
          options: value,
          https: this.$https
        });
      }
    },
    handleReplaceMenuContent(menuData) {
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
          vueInstance: this
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
    }
  }
};
