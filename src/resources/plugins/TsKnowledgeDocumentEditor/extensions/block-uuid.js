import { Extension } from '@tiptap/core';
import { Plugin } from 'prosemirror-state';
import utils from '@/resources/assets/js/util.js';

export const BlockUuid = Extension.create({
  name: 'blockUuid',
  // 给所有 block 节点加全局属性
  addGlobalAttributes() {
    return [
      {
        types: ['*'],
        attributes: {
          'data-uuid': {
            default: null,
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
          let uuidList = [];
          // 遍历当前编辑器最新状态（newState）下的所有文档节点
          newState.doc.descendants((node, pos) => {
            // 只给块级节点加 uuid（比如 paragraph、heading、list_item等）
            if (node.type.isBlock && (!node?.attrs?.['data-uuid'] || (node?.attrs?.['data-uuid'] && uuidList.includes(node.attrs['data-uuid'])))) {
              tr = tr.setNodeMarkup(pos, node?.type, {
                ...(node.attrs || {}),
                'data-uuid': utils.setUuid()
              });
              modified = true;
            }
            uuidList.push(node.attrs?.['data-uuid']);
          });
          return modified ? tr : null;
        }
      })
    ];
  }
});
