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
          ({ editor, commands, state, chain }) => {
            const isActive = editor.isActive('highlightBlock');
            const type = editor.schema.nodes.highlightBlock;
            if (isActive) {
            // 退出高亮块
              commands.lift();
              commands.setNode('paragraph');
              return true;
            }
            return chain()
              .selectParentNode() // 将选取范围扩展到父节点，比如选中几个文字的时候，需要去替换整个父节点
              .wrapIn(type, { uuid: utils.setUuid() }).run();
          },
      setHighlightBlock: (text = '高亮块内容...') => ({commands}) => {
        const uuid = utils.setUuid();
        return commands.insertContent({
          type: 'highlightBlock',
          attrs: { uuid },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: text || '' }]
            }
          ]
        });
      }
    };
  }
});

export default HighlightBlock;
