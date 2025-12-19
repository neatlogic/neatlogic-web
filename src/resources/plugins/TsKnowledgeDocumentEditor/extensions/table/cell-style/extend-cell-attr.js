import TableCell from '@tiptap/extension-table-cell';

export const ExtendTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),

      background: {
        default: null
      },

      verticalAlign: {
        default: 'top'
      }
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const { background, verticalAlign } = node.attrs;
    const style = [];

    if (background) {
      style.push(`background-color: ${background}`);
    }

    if (verticalAlign && verticalAlign !== 'top') {
      style.push(`vertical-align: ${verticalAlign}`);
    }

    return [
      'td',
      {
        ...HTMLAttributes,
        ...(style.length ? { style: style.join('; ') } : {})
      },
      0
    ];
  }
});
