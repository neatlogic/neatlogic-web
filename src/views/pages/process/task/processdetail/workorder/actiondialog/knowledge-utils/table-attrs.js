import { Extension } from '@tiptap/core';
import utils from '@/resources/assets/js/util.js';

export const TableAttrs = Extension.create({
  name: 'table-attrs',

  addGlobalAttributes() {
    return [
      {
        types: ['table'],
        attributes: {
          blockUuid: {
            default: null,
            parseHTML: (el) => {
              return el.getAttribute('data-block-uuid') || utils.setUuid();
            },
            renderHTML: (attrs) => {
              if (!attrs.blockUuid) {
                return {
                  'data-block-uuid': utils.setUuid()
                }; 
              }
              return {
                'data-block-uuid': attrs.blockUuid
              };
            }
          },
          blockType: {
            default: null,
            parseHTML: (el) => {
              return el.getAttribute('data-block-type') || 'table';
            },
            renderHTML: (attrs) => {
              return {
                'data-block-type': attrs.blockType
              };
            }
          }
        }
      }
    ];
  }
});
