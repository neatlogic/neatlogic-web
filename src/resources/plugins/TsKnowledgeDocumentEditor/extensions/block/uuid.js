import { Extension } from '@tiptap/core';
import { Plugin } from 'prosemirror-state';
import utils from '@/resources/assets/js/util.js';

const BlockUuid = Extension.create({
  name: 'blockUuid',
  addGlobalAttributes() {
    return [
      {
        types: [
          'paragraph',
          'heading',
          'blockquote',
          'bulletList',
          'orderedList',
          'listItem',
          'taskList',
          'taskItem',
          'codeBlock',
          'horizontalRule',
          'table',
          'image',
          'insertVideo',
          'highlightBlock'
        ],
        attributes: {
          'data-uuid': {
            default: null,
            parseHTML: element => element.getAttribute('data-uuid'),
            renderHTML: attributes => {
              if (!attributes['data-uuid']) return {};
              return { 'data-uuid': attributes['data-uuid'] };
            }
          },
          'data-block-type': {
            default: null,
            parseHTML: element => element.getAttribute('data-block-type'),
            renderHTML: attributes => {
              if (!attributes['data-block-type']) return {};
              return { 'data-block-type': attributes['data-block-type'] };
            }
          }
        }
      }
    ];
  },

  /**
   * 插入或者粘贴时，块级元素需要新增或者修改uuid
   */
  addProseMirrorPlugins() {
    return [
      new Plugin({
        appendTransaction: (transactions, oldState, newState) => {
          const docChanged = transactions.some(tr => tr.docChanged); // 如果没有内容变动，不处理
          if (!docChanged) return null;

          let tr = newState.tr;
          const existUuid = new Set();
          let modified = false;

          newState.doc.descendants((node, pos) => {
            if (!node.type.isBlock) return; // 只处理 block 节点

            const uuid = node.attrs['data-uuid'];
            const needNew = !uuid || existUuid.has(uuid);

            if (needNew) {
              tr = tr.setNodeMarkup(pos, node.type, {
                ...node.attrs,
                'data-uuid': utils.setUuid(),
                'data-block-type': node.type.name == 'heading' ? `heading${node.attrs.level}` : node.type.name
              });
              modified = true;
            } else {
              existUuid.add(uuid);
            }
          });
          return modified ? tr : null;
        }
      })
    ];
  }
});
export {
  BlockUuid
};
