import { Node, mergeAttributes } from '@tiptap/core';
import utils from '@/resources/assets/js/util.js';

const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,
  topNode: true,

  addAttributes() {
    return {};
  },

  parseHTML() {
    return [
      { tag: 'div[data-block-type="callout"]' },
      { tag: 'div[data-block-type="highlightBlock"]' }
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { class: 'callout', 'data-block-type': 'callout' }),
      0
    ];
  },

  addCommands() {
    return {
      toggleCallout:
        () =>
          ({ editor, commands, chain }) => {
            const type = editor.schema.nodes.callout;
            if (editor.isActive('callout')) {
              commands.lift();
              commands.setNode('paragraph');
              return true;
            }
            return chain()
              .selectParentNode()
              .wrapIn(type, { blockUuid: utils.setUuid(), blockType: 'callout' })
              .run();
          },
      insertCalloutContent: ({ position, text = '高亮快内容' }) => ({ commands }) => {
        const uuid = utils.setUuid();
        return commands.insertContentAt(position, {
          type: 'callout',
          attrs: { blockUuid: uuid, blockType: 'callout' },
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

export default Callout;
