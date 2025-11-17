import { Node } from '@tiptap/core';
import utils from '@/resources/assets/js/util.js';
const HighlightBlock = Node.create({
  name: 'highlightBlock', // 节点名称
  group: 'block', // 表示这个节点是一个块级元素
  content: 'block+', // 表示这个节点可以包含其他块级元素
  defining: true, // 表示这个节点是一个整体，不能被分割

  addAttributes() {
    return {
      uuid: {
        default: null,
        parseHTML: (element) => element.getAttribute('uuid'),
        renderHTML: (attributes) => ({ 'uuid': attributes.uuid })
      }
    };
  },

  parseHTML() {
    // 解析 HTML 时，将 <div data-type="highlight-block"> 转换为 highlightBlock 节点
    return [{ tag: 'div[data-type="highlight-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    // 渲染 HTML 时，将 highlightBlock 节点转换为 <div data-type="highlight-block">
    // ['标签名', {属性}, 子节点]
    return [
      'div',
      {
        'data-type': 'highlight-block',
        class: 'highlight-block',
        ...HTMLAttributes
      },
      0
    ];
  },

  addCommands() {
    // 定义一个命令，用于切换高亮块的状态
    return {
      toggleHighlightBlock:
        () =>
          ({ editor, commands, state }) => {
            const isActive = editor.isActive('highlightBlock');

            if (isActive) {
            // 退出高亮块
              commands.lift();
              commands.setNode('paragraph');
              return true;
            }

            // 插入新的高亮块
            commands.focus();
            commands.insertContent({
              type: 'highlightBlock',
              attrs: { uuid: utils.setUuid() },
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: '高亮块内容…' }]
                }
              ]
            });
            return true;
          }
    };
  }
});

export default HighlightBlock;
