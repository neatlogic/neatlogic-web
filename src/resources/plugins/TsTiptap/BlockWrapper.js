import Paragraph from '@tiptap/extension-paragraph';
import { mergeAttributes } from '@tiptap/core';

export const BlockWrapper = Paragraph.extend({
  name: 'paragraph', // ⚠️ 注意：这里必须还是 paragraph，替换掉默认的

  group: 'block',

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const wrapper = document.createElement('div');
      wrapper.classList.add('block-wrapper');

      const leftTools = document.createElement('div');
      leftTools.classList.add('block-tools');

      // --- 拖拽柄 ---
      const dragHandle = document.createElement('div');
      dragHandle.classList.add('drag-handle');
      dragHandle.innerHTML = '⋮⋮';
      dragHandle.setAttribute('draggable', 'true');

      dragHandle.addEventListener('dragstart', event => {
        event.dataTransfer.setData('text/plain', getPos());
        event.dataTransfer.effectAllowed = 'move';
      });

      // --- 插入按钮 ---
      const insertBtn = document.createElement('div');
      insertBtn.classList.add('insert-btn');
      insertBtn.innerHTML = '+';
      insertBtn.onclick = () => {
        editor.commands.insertContentAt(getPos() + node.nodeSize, {
          type: 'paragraph',
          content: [{ type: 'text', text: '新段落' }]
        });
      };

      leftTools.appendChild(dragHandle);
      leftTools.appendChild(insertBtn);

      // --- 内容容器 ---
      const content = document.createElement('div');
      content.classList.add('block-content');

      wrapper.appendChild(leftTools);
      wrapper.appendChild(content);

      return {
        dom: wrapper,
        contentDOM: content
      };
    };
  }
});
