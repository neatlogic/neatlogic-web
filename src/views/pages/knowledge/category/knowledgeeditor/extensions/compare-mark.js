import { Extension, Mark, mergeAttributes } from '@tiptap/core';

const COMPARE_BLOCK_TYPES = [
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
  'tableRow',
  'tableCell',
  'tableHeader',
  'image',
  'insertVideo',
  'highlightBlock'
];

const ALLOWED_CHANGE_TYPES = ['insert', 'delete', 'update'];

function getChangeType(changeType) {
  return ALLOWED_CHANGE_TYPES.includes(changeType) ? changeType : null;
}

export const CompareMark = Mark.create({
  name: 'compareMark',

  addAttributes() {
    return {
      changeType: {
        default: null,
        parseHTML: element => getChangeType(element.getAttribute('data-compare-change-type')),
        renderHTML: attributes => {
          const changeType = getChangeType(attributes.changeType);
          if (!changeType) {
            return {};
          }
          return {
            'data-compare-change-type': changeType,
            class: `knowledge-compare-mark knowledge-compare-${changeType}`
          };
        }
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-compare-change-type]'
      }
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes), 0];
  }
});

export const CompareBlockAttrs = Extension.create({
  name: 'compareBlockAttrs',

  addGlobalAttributes() {
    return [
      {
        types: COMPARE_BLOCK_TYPES,
        attributes: {
          compareChangeType: {
            default: null,
            parseHTML: element => getChangeType(element.getAttribute('data-compare-change-type')),
            renderHTML: attributes => {
              const changeType = getChangeType(attributes.compareChangeType);
              if (!changeType) {
                return {};
              }
              return {
                'data-compare-change-type': changeType,
                class: `knowledge-compare-block knowledge-compare-${changeType}`
              };
            }
          }
        }
      }
    ];
  }
});
