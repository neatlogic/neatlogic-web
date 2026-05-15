import { Extension } from '@tiptap/core';

function getStyleText(element) {
  return element.getAttribute('style') || null;
}

function renderStyle(attributes, key = 'style') {
  const style = attributes[key];
  return style ? { style } : {};
}

export const TableStyle = Extension.create({
  name: 'knowledgeTableStyle',

  addGlobalAttributes() {
    return [
      {
        types: ['table'],
        attributes: {
          style: {
            default: null,
            parseHTML: getStyleText,
            renderHTML: attributes => renderStyle(attributes)
          },
          tableStyle: {
            default: null,
            renderHTML: () => ({})
          }
        }
      },
      {
        types: ['tableRow'],
        attributes: {
          rowStyle: {
            default: null,
            parseHTML: getStyleText,
            renderHTML: attributes => renderStyle(attributes, 'rowStyle')
          },
          rowHeight: {
            default: null,
            renderHTML: () => ({})
          }
        }
      }
    ];
  }
});
