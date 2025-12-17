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
            default: null, // 不要默认值，避免重复 uuid
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
   * 只处理“新增的 block 节点”
   * 避免每次扫描全文档，提高性能
   */
  addProseMirrorPlugins() {
    return [
      new Plugin({
        appendTransaction: (transactions, oldState, newState) => {
          // 如果没有内容变动，不处理
          const docChanged = transactions.some(tr => tr.docChanged);
          if (!docChanged) return null;

          let tr = newState.tr;
          let modified = false;

          newState.doc.descendants((node, pos) => {
            // 只处理 block 节点
            if (!node.type.isBlock) return;

            // 已有 uuid 的跳过
            if (node.attrs['data-uuid']) return;
            tr = tr.setNodeMarkup(pos, node.type, {
              ...node.attrs,
              'data-uuid': utils.setUuid(),
              'data-block-type': node.type.name == 'heading' ? `heading${node.attrs.level}` : node.type.name
            });
            modified = true;
          });
          return modified ? tr : null;
        }
      })
    ];
  }
});
export default BlockUuid;
