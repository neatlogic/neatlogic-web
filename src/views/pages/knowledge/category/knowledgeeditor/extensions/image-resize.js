// ImageResize.js
import { Node, mergeAttributes } from '@tiptap/core';
import { NodeSelection } from 'prosemirror-state';

const COMPARE_CLASS_LIST = [
  'knowledge-compare-block',
  'knowledge-compare-insert',
  'knowledge-compare-delete',
  'knowledge-compare-update'
];

function getCompareChangeType(attrs = {}) {
  return ['insert', 'delete', 'update'].includes(attrs.compareChangeType) ? attrs.compareChangeType : null;
}

function syncCompareState(elements = [], attrs = {}) {
  const changeType = getCompareChangeType(attrs);
  elements.forEach(element => {
    if (!element) {
      return;
    }
    element.classList.remove(...COMPARE_CLASS_LIST);
    if (changeType) {
      element.dataset.compareChangeType = changeType;
      element.classList.add('knowledge-compare-block', `knowledge-compare-${changeType}`);
    } else {
      delete element.dataset.compareChangeType;
    }
  });
}

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
        parseHTML: element => element.getAttribute('data-align') || element.style.textAlign || 'left',
        renderHTML: attrs => {
          return {
            'data-align': attrs.align,
            style: `text-align: ${attrs.align || 'left'}`
          };
        }
      },
      uploadId: { // 上传的ID，用于粘贴图片时，给一个加载中的占位符，图片异步成功后，替换加载中的占位符的内容为真实的内容
        default: null
      },
      uploading: {
        default: false
      }
    };
  },
  addCommands() {
    return {
      setImage:
      options =>
        ({ commands }) => {
          //新增插入图片的方法，去掉extension-image插件，插入图片统一用这个方法
          return commands.insertContent({
            type: this.name,
            attrs: options
          });
        },
      alignImage:
      align =>
        ({ commands }) => {
          return commands.updateAttributes('image', { align });
        }
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-block-type="image"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const align = HTMLAttributes['data-align'] || 'left';
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-block-type': 'image',
        style: `text-align: ${align}`
      }),
      ['img', mergeAttributes(HTMLAttributes)]
    ];
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      /* ================= root dom ================= */
      const dom = document.createElement('div');
      dom.contentEditable = 'false';
      dom.dataset.blockType = 'image';
      Object.assign(dom.style, {
        width: '100%',
        textAlign: node.attrs.align || 'left'
      });
  
      /* ================= wrapper ================= */
      const wrapper = document.createElement('div');
      wrapper.className = 'image-wrapper';
      Object.assign(wrapper.style, {
        position: 'relative',
        display: 'inline-block'
      });
      dom.appendChild(wrapper);
  
      /* ================= image ================= */
      const img = document.createElement('img');
      img.draggable = false;
      Object.assign(img.style, {
        userSelect: 'none',
        maxWidth: '100%',
        visibility: 'hidden' // 👈 不用 display
      });
      wrapper.appendChild(img);
  
      /* ================= loading overlay ================= */
      const loading = document.createElement('div');
      Object.assign(loading.style, {
        width: '200px',
        height: '200px',
        background: '#f5f6fa',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none'
      });
  
      const spinner = document.createElement('div');
      Object.assign(spinner.style, {
        width: '20px',
        height: '20px',
        border: '4px solid #d3d3d3',
        borderTopColor: '#409EFF',
        borderRadius: '50%',
        animation: 'loadingSpin 1s linear infinite'
      });
  
      loading.appendChild(spinner);
      wrapper.appendChild(loading);
  
      /* ================= status ================= */
      let status = 'loading'; // loading | loaded | error
      let handlesCreated = false;
      const handles = {};
      const positions = ['nw', 'ne', 'sw', 'se'];
      const isResizeEnabled = () => editor && editor.isEditable;
  
      const setStatus = s => {
        status = s;
        wrapper.classList.remove('loading', 'loaded', 'error');
  
        if (s === 'loaded') {
          img.style.visibility = 'visible';
          loading.style.display = 'none';
          createHandles();
        } else {
          img.style.visibility = 'hidden';
          loading.style.display = 'flex';
        }
      };
  
      /* ================= image load events ================= */
      img.onload = () => setStatus('loaded');
      img.onerror = () => setStatus('error');
  
      /* ================= resize handles ================= */

      const createHandles = () => {
        if (handlesCreated) return;
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
            display: 'none'
          });
          wrapper.appendChild(h);
          handles[pos] = h;

          // resize 事件
          h.addEventListener('mousedown', e => startResize(e, pos));
        });
        updateHandlePos();
        handlesCreated = true;
      };
      const updateHandlePos = () => {
        if (Object.values(handles).length == 0) {
          return false;
        }
        handles.nw.style.left = handles.sw.style.left = '-5px';
        handles.ne.style.right = handles.se.style.right = '-5px';
        handles.nw.style.top = handles.ne.style.top = '-5px';
        handles.sw.style.bottom = handles.se.style.bottom = '-5px';
      };
     
      /* ================= selection ================= */
      const updateHandleVisible = () => {
        if (!isResizeEnabled()) {
          Object.values(handles).forEach(h => {
            if (!h) return;
            h.style.display = 'none';
          });
          return;
        }
        const { selection } = editor.state;
        const selected =
          selection instanceof NodeSelection &&
          selection.node === node;
  
        Object.values(handles).forEach(h => {
          if (!h) return;
          // 仅在图片加载完成后显示 handles
          h.style.display = status === 'loaded' && selected ? 'block' : 'none';
        });
      };
  
      editor.on('selectionUpdate', updateHandleVisible);
  
      img.addEventListener('click', () => {
        if (!isResizeEnabled()) {
          updateHandleVisible();
          return;
        }
        const { view } = editor;
        view.dispatch(
          view.state.tr.setSelection(
            NodeSelection.create(view.state.doc, getPos())
          )
        );
        updateHandleVisible(); // 点击图片的时候，显示四边可拖拽的图标
      });
  
      /* ================= resize logic ================= */
      let startX, startY, startW, startH;
  
      const startResize = (e, pos) => {
        if (!isResizeEnabled()) {
          updateHandleVisible();
          return;
        }
        e.preventDefault();
        startX = e.clientX;
        startY = e.clientY;
        startW = img.offsetWidth;
        startH = img.offsetHeight;
  
        const move = ev => {
          const dx = ev.clientX - startX;
          const dy = ev.clientY - startY;
  
          let w = startW;
          let h = startH;
  
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
  
      /* ================= sync from node ================= */
      const syncFromNode = node => {
        // 图片对齐依赖外层块的 text-align；节点属性更新后必须同步到 NodeView DOM。
        dom.style.textAlign = node.attrs.align || 'left';

        dom.style.textAlign = node.attrs.align || 'left';
        syncCompareState([dom, wrapper], node.attrs);

        if (!node.attrs.src) {
          setStatus('loading');
          img.removeAttribute('src');
          return;
        }
  
        // img.src 会被浏览器转换成绝对地址，对齐更新时用原始属性比较可避免误判重载图片。
        if (img.getAttribute('src') !== node.attrs.src) {
          setStatus('loading');
          img.setAttribute('src', node.attrs.src);
        }
  
        if (node.attrs.width) img.style.width = node.attrs.width + 'px';
        if (node.attrs.height) img.style.height = node.attrs.height + 'px';
      };
  
      /* ================= init ================= */
      syncFromNode(node);
      updateHandleVisible();
  
      /* ================= NodeView API ================= */
      return {
        dom,
        update(updatedNode) {
          if (updatedNode.type.name !== 'image') return false;
          node = updatedNode;
          syncFromNode(updatedNode);
          updateHandleVisible();
          return true;
        },
        destroy() {
          editor.off('selectionUpdate', updateHandleVisible);
        }
      };
    };
  }

});
