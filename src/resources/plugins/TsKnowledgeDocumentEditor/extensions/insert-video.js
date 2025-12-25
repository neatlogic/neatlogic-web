import { Node, mergeAttributes } from '@tiptap/core';
const InsertVideo = Node.create({
  name: 'insertVideo',
  group: 'block',
  atom: true,
  selectable: true,
  addAttributes() {
    return {
      src: { default: null },
      controls: { default: true },
      width: {
        default: null,
        parseHTML: (element) => {
          const width = element.style.width || element.getAttribute('width');
          return width ? parseInt(width, 10) : null;
        },
        renderHTML: attrs => {
          if (!attrs.width) return {};
          return ({
            style: `width:${attrs.width}px;`
          });
        }
      },
      height: {
        default: null,
        parseHTML: element => {
          const height =
          element.style.height ||
          element.getAttribute('height');
          return height ? parseInt(height, 10) : null;
        },
        renderHTML: attrs => {
          if (!attrs.height) return {};
          return {
            style: `height:${attrs.height}px`
          };
        }
      },
      aspectRatio: { default: null }, // 宽高比（width / height），用于计算高度

      loading: {
        default: false,
        renderHTML: attrs => (attrs.loading ? { 'data-loading': 'true' } : {})
      },
      'data-uuid': {
        default: null,
        parseHTML: (element) => element.getAttribute('data-uuid'),
        renderHTML: (attributes) => ({ 'data-uuid': attributes['data-uuid'] })
      },
      'data-block-type': {
        default: 'insert-video',
        parseHTML: (element) => element.getAttribute('data-block-type'),
        renderHTML: (attributes) => ({ 'data-block-type': attributes['data-block-type'] })
      }
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-block-type="insert-video"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    const { src, width, controls, loading } = HTMLAttributes;
    // 加载中状态
    if (loading || !src) {
      return [
        'div',
        mergeAttributes(HTMLAttributes, {
          'data-type': 'insert-video',
          style: `
            width:${width};
            height:200px;
            display:flex;
            align-items:center;
            justify-content:center;
            background:#f8f9fb;
            border:1px dashed #dcdfe6;
            border-radius:8px;
          `
        }),
        [
          'div',
          {
            style: `
              width:40px;
              height:40px;
              border:4px solid #d3d3d3;
              border-top-color:#409EFF;
              border-radius:50%;
              animation: videoLoadingSpin 1s linear infinite;
            `
          }
        ]
      ];
    }
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-block-type': 'insert-video'
      }),
      ['video', { src: src, controls: controls}]
    ];
  },
  addCommands() {
    return {
      insertVideo: (options) => ({ commands }) => {
        const { position, ...restAttrs } = options || {};
        return commands.insertContentAt(position, {
          type: this.name,
          attrs: {
            ...(restAttrs || {})
          }
        });
      },
      updateVideo: (options) => ({ tr, state }) => {
        const { uuid, position, ...newAttrs } = options || {};
        tr.doc.descendants((node, pos) => { // 遍历文档中的所有节点
          if (node.type.name === this.name && node.attrs['data-uuid'] === uuid) {
            tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...newAttrs });
          }
        });
      }
    };
  },
  addNodeView() {
    return ({ editor, node, getPos }) => {
      /** ========== DOM ========== */
      const wrapper = document.createElement('div');
      wrapper.className = 'video-block';
      wrapper.dataset.blockType = 'insert-video';
      wrapper.dataset.uuid = node.attrs['data-uuid'];

      const video = document.createElement('video');
      video.src = node.attrs.src;
      video.controls = node.attrs.controls;

      applySize(video, node.attrs);

      const resizeHandle = document.createElement('div');
      resizeHandle.className = 'video-resize-handle';

      wrapper.appendChild(video);
      wrapper.appendChild(resizeHandle);

      /* ========== hover 状态 ========== */
      wrapper.addEventListener('mouseenter', () => {
        wrapper.classList.add('is-hover');
      });

      wrapper.addEventListener('mouseleave', () => {
        wrapper.classList.remove('is-hover');
      });

      /** ========== 单角同比缩放 ========== */
      let startX = 0;
      let startWidth = 0;
      let ratio = node.attrs.aspectRatio;
      let isResizing = false;
      const MIN_WIDTH = 50; // 最小宽度

      let onMove = null;
      let onUp = null;
      
      const forceStopResize = () => {
        if (!isResizing) return;
  
        isResizing = false;
  
        if (onMove) {
          document.removeEventListener('mousemove', onMove);
          onMove = null;
        }
        if (onUp) {
          document.removeEventListener('mouseup', onUp);
          onUp = null;
        }
      };

      resizeHandle.addEventListener('mousedown', e => {
        if (e.button !== 0) return; // 只允许左键
        e.preventDefault();
        e.stopPropagation();
        e.preventDefault();
        e.stopPropagation();

        isResizing = true;
        startX = e.clientX;
        startWidth = video.offsetWidth;

        if (!ratio) {
          ratio = video.offsetWidth / video.offsetHeight;
        }

        onMove = moveEvent => {
          if (!isResizing) return;
          if (moveEvent.buttons !== 1) {
            forceStopResize();
            return;
          }

          const delta = moveEvent.clientX - startX;
          let newWidth = startWidth + delta;

          if (newWidth <= MIN_WIDTH) {
            newWidth = MIN_WIDTH;
            startX = moveEvent.clientX;
            startWidth = MIN_WIDTH;
          }

          video.style.width = `${newWidth}px`;
          video.style.height = `${Math.round(newWidth / ratio)}px`;
        };

        onUp = () => {
          forceStopResize();

          editor
            .chain()
            .command(({ tr }) => {
              tr.setNodeMarkup(getPos(), undefined, {
                ...node.attrs,
                width: video.offsetWidth,
                height: video.offsetHeight,
                aspectRatio: ratio
              });
              return true;
            })
            .run();
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });

      /** ========== NodeView 生命周期 ========== */
      return {
        dom: wrapper,

        update(updatedNode) {
          if (updatedNode.type.name !== 'insertVideo') return false;
          forceStopResize();
          return true;
        },
        destroy() {
          forceStopResize();
        }
      };
    };
  }
});

function applySize(video, attrs) {
  if (attrs.width) video.style.width = `${attrs.width}px`;
  if (attrs.height) video.style.height = `${attrs.height}px`;
}
export default InsertVideo;
