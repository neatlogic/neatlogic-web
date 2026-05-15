import { Node } from '@tiptap/core';

export const Rate = Node.create({
  name: 'rate',

  group: 'block',

  atom: true, // 非可拆分节点

  selectable: true,

  addAttributes() {
    return {
      value: {
        default: 0
      },
      max: {
        default: 5
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'rate',
        getAttrs: dom => {
          return {
            value: Number(dom.getAttribute('data-value') || 0),
            max: Number(dom.getAttribute('data-max') || 5)
          };
        }
      }
    ];
  },

  renderHTML({ node }) {
    const { value, max } = node.attrs;

    const children = [];

    for (let i = 0; i < max; i++) {
      children.push([
        'span',
        {
          class: i < value ? 'star star-active' : 'star'
        },
        i < value ? '★' : '☆'
      ]);
    }

    return [
      'rate',
      {
        'data-type': 'rate',
        'data-value': value,
        'data-max': max
      },
      ...children
    ];
  }
});
