import { Extension } from '@tiptap/core';

export const BlockStyle = Extension.create({
  name: 'blockStyle',

  addGlobalAttributes() {
    return [
      {
        types: [
          'paragraph',
          'heading',
          'blockquote',
          'listItem',
          'taskItem',
          'highlightBlock'
        ],
        attributes: {
          blockTextColor: {
            default: null,
            parseHTML: element => {
              return element.style.color || null;
            },
            renderHTML: attributes => {
              if (!attributes.blockTextColor) return {};
              return { style: `color:${attributes.blockTextColor}` };
            }
          },

          blockBackgroundColor: {
            default: null,
            parseHTML: element => {
              return element.style.backgroundColor || null;
            },
            renderHTML: attributes => {
              if (!attributes.blockBackgroundColor) return {};
              return { style: `background-color:${attributes.blockBackgroundColor}` };
            }
          },
          blockBorderColor: {
            default: null,
            parseHTML: element => {
              return element.style.borderColor || null;
            },
            renderHTML: attributes => {
              if (!attributes.blockBorderColor) return {};
              return { style: `border-color:${attributes.blockBorderColor}` };
            }
          }
        }
      }
    ];
  },

  addCommands() {
    return {
      setBlockStyle:
        ({ uuid, pos, blockTextColor, blockBackgroundColor, blockBorderColor }) =>
          ({ state, dispatch }) => {
            let target = null;

            if (uuid) {
              state.doc.descendants((node, pos) => {
                if (node.isBlock && node.attrs['blockUuid'] === uuid) {
                  target = { node, pos };
                  return false;
                }
              });
            } else if (pos != null) {
              const $pos = state.doc.resolve(pos);
              for (let d = $pos.depth; d > 0; d--) {
                if ($pos.node(d).isBlock) {
                  target = {
                    node: $pos.node(d),
                    pos: $pos.before(d)
                  };
                  break;
                }
              }
            }
            if (!target) return false;
            const getNextAttrs = nodeAttrs => ({
              ...nodeAttrs,
              ...(blockTextColor !== undefined ? { blockTextColor: blockTextColor || null } : {}),
              ...(blockBackgroundColor !== undefined ? { blockBackgroundColor: blockBackgroundColor || null } : {}),
              ...(blockBorderColor !== undefined ? { blockBorderColor: blockBorderColor || null } : {})
            });

            if (target.node.type.name === 'taskItem') {
              // 如果是任务列表，单独处理子节点
              target.node.descendants((child, childPos) => {
                if (child.type.name === 'paragraph') {
                  dispatch(
                    state.tr.setNodeMarkup(target.pos + childPos + 1, undefined, getNextAttrs(child.attrs))
                  );
                  return false;
                }
              });
              return true;
            }

            dispatch(
              state.tr.setNodeMarkup(target.pos, undefined, getNextAttrs(target.node.attrs))
            );

            return true;
          }
    };
  }
});
