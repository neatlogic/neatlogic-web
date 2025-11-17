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
          uuid: {
            default: utils.setUuid(),
            parseHTML: element => element.getAttribute('data-uuid'),
            renderHTML: attributes => {
              return { 'data-uuid': attributes.uuid };
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
            console.log('node', node.type.isBlock, !node.attrs?.uuid);
            
            if (node.type.isBlock && (!node?.attrs?.uuid || (node?.attrs?.uuid && uuidList.includes(node.attrs.uuid)))) {
              console.log('nodes', node);
              
              tr = tr.setNodeMarkup(pos, node?.type, {
                ...(node.attrs || {}),
                uuid: utils.setUuid()
              });
              modified = true;
            }
            uuidList.push(node.attrs?.uuid);
          });

          return modified ? tr : null;
        }
      })
    ];
  },
  addKeyboardShortcuts() {
    return {
      Backspace: () => {
        console.log('Keyboard shortcut executed');
      }
    };
  }
});
