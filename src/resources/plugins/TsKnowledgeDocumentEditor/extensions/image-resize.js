// ImageResize.js
import { Node, mergeAttributes } from '@tiptap/core';
import { NodeSelection } from 'prosemirror-state';

export const ImageResize = Node.create({
  name: 'image',

  inline: false,
  group: 'block',
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      width: { default: null },
      height: { default: null },
      align: {
        default: 'left', // left / center / right
        renderHTML: attrs => {
          return { 'data-align': attrs.align };
        }
      }
    };
  },
  addCommands() {
    return {
      alignImage:
      align =>
        ({ commands }) => {
          return commands.updateAttributes('image', { align });
        }
    };
  },

  parseHTML() {
    return [{ tag: 'img' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const dom = document.createElement('div');
      dom.classList.add('image-container');
      dom.style.textAlign = node.attrs.align || 'left';
      dom.style.width = '100%';
      dom.style.display = 'block';
      dom.style.position = 'relative';

      const divImg = document.createElement('div');
      divImg.classList.add('image-wrapper');
      divImg.style.display = 'inline-block';
      divImg.style.position = 'relative';
      dom.appendChild(divImg);

      const img = document.createElement('img');
      img.src = node.attrs.src;
      if (node.attrs.width) img.style.width = node.attrs.width + 'px';
      if (node.attrs.height) img.style.height = node.attrs.height + 'px';
      img.style.userSelect = 'none';
      img.draggable = false;

      divImg.appendChild(img);

      // ---- 4 个缩放点 ----
      const positions = ['nw', 'ne', 'sw', 'se'];
      const handles = {};

      positions.forEach(pos => {
        const h = document.createElement('div');
        h.className = `resize-handle ${pos}`;
        Object.assign(h.style, {
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          background: '#fff',
          border: '1px solid #000',
          position: 'absolute',
          zIndex: 10,
          cursor: `${pos}-resize`,
          display: 'none' // 初始隐藏
        });
        divImg.appendChild(h);
        handles[pos] = h;
      });

      // 放置位置
      const updateHandlePos = () => {
        handles.nw.style.left = '-5px';
        handles.nw.style.top = '-5px';
        handles.ne.style.right = '-5px';
        handles.ne.style.top = '-5px';
        handles.sw.style.left = '-5px';
        handles.sw.style.bottom = '-5px';
        handles.se.style.right = '-5px';
        handles.se.style.bottom = '-5px';
      };
      updateHandlePos();

      // ---- 判断是不是选中当前这个 image ----
      const updateHandleVisible = () => {
        const { state } = editor;
        const sel = state.selection;

        const selected =
        sel instanceof NodeSelection &&
        sel.node === node; // 验证是否选中这个 image 节点

        Object.values(handles).forEach(h => {
          h.style.display = selected ? 'block' : 'none';
        });
      };

      // ---- 监听编辑器 selection 状态变化 ----
      editor.on('selectionUpdate', updateHandleVisible);
      // 初次同步一次
      updateHandleVisible();

      // ---- 点击图片 → 选中该图片 ----
      img.addEventListener('click', () => {
        const { view } = editor;
        view.dispatch(
          view.state.tr.setSelection(
            NodeSelection.create(view.state.doc, getPos())
          )
        );
      });

      // ---- Resize 逻辑（不动，只在选中时可见） ----
      let startX, startY, startWidth, startHeight;

      const startResize = (e, pos) => {
        e.preventDefault();
        startX = e.clientX;
        startY = e.clientY;
        startWidth = img.offsetWidth;
        startHeight = img.offsetHeight;

        const move = ev => {
          const dx = ev.clientX - startX;
          const dy = ev.clientY - startY;

          let w = startWidth;
          let h = startHeight;

          if (pos === 'se') { w += dx; h += dy; }
          if (pos === 'sw') { w -= dx; h += dy; }
          if (pos === 'ne') { w += dx; h -= dy; }
          if (pos === 'nw') { w -= dx; h -= dy; }

          if (w > 20) img.style.width = w + 'px';
          if (h > 20) img.style.height = h + 'px';

          updateHandlePos();
        };

        const up = () => {
          document.removeEventListener('mousemove', move);
          document.removeEventListener('mouseup', up);

          editor.commands.updateAttributes('image', {
            width: img.offsetWidth,
            height: img.offsetHeight
          });
        };

        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', up);
      };

      Object.entries(handles).forEach(([pos, h]) => {
        h.addEventListener('mousedown', e => startResize(e, pos));
      });

      // ---- 返回 NodeView ----
      return {
        dom,
        destroy() {
          if (editor && typeof editor.off === 'function') {
            editor.off('selectionUpdate', updateHandleVisible);
          }
        }
      };
    };
  }

});
