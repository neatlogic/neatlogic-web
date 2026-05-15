import { Extension } from '@tiptap/core';
import { Plugin } from 'prosemirror-state';
import { Fragment, Slice } from 'prosemirror-model';
import utils from '@/resources/assets/js/util.js';

export const RewriteUuidOnPaste = Extension.create({
  name: 'rewrite-uuid-on-paste',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          transformPasted(slice) {
            function rewriteNode(node) {
              if (node.isText) {
                // text node 不改 uuid
                return node;
              }
              const newAttrs = { ...node.attrs };
              if (newAttrs.blockUuid) {
                newAttrs.blockUuid = utils.setUuid();
              }

              if (node.content?.size) {
                const children = node.content.content.map(child => rewriteNode(child));
                return node.type.create(newAttrs, Fragment.fromArray(children), node.marks);
              }

              return node.type.create(newAttrs, null, node.marks);
            }

            const newFragment = Fragment.fromArray(slice.content.content.map(node => rewriteNode(node)));
            return new Slice(newFragment, slice.openStart, slice.openEnd);
          }
        }
      })
    ];
  }
});
