import { Extension } from '@tiptap/core';
import { Plugin } from 'prosemirror-state';
import utils from '@/resources/assets/js/util.js';

const BlockUuid = Extension.create({
  name: 'blockUuid',
  // 给所有 block 节点加全局属性
  addGlobalAttributes() {
    return [
      {
        types: ['*'],
        attributes: {
          'data-uuid': {
            default: utils.setUuid(),
            parseHTML: element => element.getAttribute('data-uuid'),
            renderHTML: attributes => {
              return { 'data-uuid': attributes['data-uuid'] };
            }
          }
        }
      }
    ];
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        // appendTransaction 在节点内容变更或者插入内容的时候触发
        appendTransaction: (transactions, oldState, newState) => {
          let tr = newState.tr;
          let modified = false;
          newState.doc.descendants((node, pos) => {
            if (!node?.attrs?.['data-uuid']) {
              tr = tr.setNodeMarkup(pos, node?.type, {
                ...(node.attrs || {}),
                'data-uuid': utils.setUuid()
              });
              modified = true;
            }
          });
          return modified ? tr : null;
        }
      })
    ];
  }
});
export default BlockUuid;
