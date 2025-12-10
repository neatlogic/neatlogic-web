import { Node } from '@tiptap/core';
import utils from '@/resources/assets/js/util.js';
const HighlightBlock = Node.create({
  name: 'highlightBlock', // 节点名称
  group: 'block',
  content: 'block+',
  defining: true,
  topNode: true,
  addAttributes() {
    return {
      'data-uuid': {
        default: null,
        parseHTML: (element) => {
          return element.getAttribute('data-uuid') || utils.setUuid();
        },
        renderHTML: (attributes) => ({ 'data-uuid': attributes['data-uuid'] || utils.setUuid() })
      }
    };
  },

  parseHTML() {
    // 解析 HTML 时，将 <div data-type="highlight-block"> 转换为 highlightBlock 节点
    return [{ tag: 'div[data-type="highlightBlock"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    // 渲染 HTML 时，将 highlightBlock 节点转换为 <div data-type="highlight-block">
    // ['标签名', {属性}, 子节点]
    return [
      'div',
      {
        'data-type': 'highlightBlock',
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
              .wrapIn(type, { 'data-uuid': utils.setUuid() }).run();
          },
      insertHighlightBlockContent: ({position, text = '高亮块内容...'}) => ({commands}) => {
        const uuid = utils.setUuid();
        return commands.insertContentAt(position, {
          type: 'highlightBlock',
          attrs: { 'data-uuid': uuid },
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
