import TableCell from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table';

function normalizeStyle(style) {
  return String(style || '').trim().replace(/;$/, '');
}

function joinStyle(styleList = []) {
  return styleList.map(normalizeStyle).filter(Boolean).join('; ');
}

function removeStyleProperties(style = '', propertyList = []) {
  const propertySet = new Set(propertyList.map(property => property.toLowerCase()));
  return String(style || '').split(';').map(item => item.trim()).filter(item => {
    const property = item.split(':')[0]?.trim().toLowerCase();
    return property && !propertySet.has(property);
  }).join('; ');
}

function buildCellStyle(attrs = {}) {
  return joinStyle([
    removeStyleProperties(attrs.cellStyle, ['border-bottom']),
    attrs.background ? `background-color: ${attrs.background}` : '',
    attrs.verticalAlign && attrs.verticalAlign !== 'top' ? `vertical-align: ${attrs.verticalAlign}` : ''
  ]);
}

export const ExtendTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),

      cellStyle: {
        default: null,
        parseHTML: element => element.getAttribute('style') || null,
        renderHTML: () => ({})
      },

      background: {
        default: null,
        parseHTML: element => element.style.backgroundColor || null,
        renderHTML: () => ({})
      },

      verticalAlign: {
        default: 'top',
        parseHTML: element => element.style.verticalAlign || 'top',
        renderHTML: () => ({})
      }
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const style = buildCellStyle(node.attrs);

    return [
      'td',
      {
        ...HTMLAttributes,
        ...(style ? { style } : {})
      },
      0
    ];
  }
});

export const ExtendTableHeader = TableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),

      cellStyle: {
        default: null,
        parseHTML: element => element.getAttribute('style') || null,
        renderHTML: () => ({})
      },

      background: {
        default: null,
        parseHTML: element => element.style.backgroundColor || null,
        renderHTML: () => ({})
      },

      verticalAlign: {
        default: 'top',
        parseHTML: element => element.style.verticalAlign || 'top',
        renderHTML: () => ({})
      }
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const style = buildCellStyle(node.attrs);

    return [
      'th',
      {
        ...HTMLAttributes,
        ...(style ? { style } : {})
      },
      0
    ];
  }
});
