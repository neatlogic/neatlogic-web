import { Node, mergeAttributes } from '@tiptap/core';

const COMPARE_CLASS_LIST = [
  'knowledge-compare-block',
  'knowledge-compare-insert',
  'knowledge-compare-delete',
  'knowledge-compare-update'
];

function getCompareChangeType(attrs = {}) {
  return ['insert', 'delete', 'update'].includes(attrs.compareChangeType) ? attrs.compareChangeType : null;
}

function syncCompareState(element, attrs = {}) {
  const changeType = getCompareChangeType(attrs);
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
}

const InsertVideo = Node.create({
  name: 'insertVideo',
  group: 'block',
  atom: true,
  selectable: false,
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
      // 标记位，上传占位符，用于更新内容
      recordUuid: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-record-uuid'),
        renderHTML: (attributes) => ({ 'data-record-uuid': attributes['recordUuid'] })
      }
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-block-type="insert-video"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    const { src, controls } = HTMLAttributes;
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-block-type': 'insert-video',
        'data-block-uuid': HTMLAttributes['data-block-uuid']
      }),
      ['video', { src: src, controls: controls }]
    ];
  },
  addCommands() {
    return {
      insertVideo: (options) => ({ commands }) => {
        const { position, ...restAttrs } = options || {};
        return commands.insertContentAt(position, {
          type: this.name,
          attrs: {
            src: '',
            ...(restAttrs || {})
          }
        });
      },
      updateVideo: (options) => ({ tr, state }) => {
        const { recordUuid, position, ...newAttrs } = options || {};
        tr.doc.descendants((node, pos) => { // 遍历文档中的所有节点
          if (node.type.name === this.name && node.attrs['recordUuid'] === recordUuid) {
            tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...newAttrs });
          }
        });
        return true;
      }
    };
  },
  addNodeView() {
    return ({ editor, node, getPos }) => {
      /** 外层节点和属性 */
      const wrapper = document.createElement('div');
      wrapper.className = 'video-block';
      wrapper.contentEditable = 'false';
      wrapper.dataset.blockType = 'insert-video';
      wrapper.dataset.recordUuid = node.attrs['recordUuid'];
      wrapper.dataset.blockUuid = node.attrs['blockUuid'];

      // loading的加载节点
      const loading = document.createElement('div');
      loading.className = 'video-loading';

      const video = document.createElement('video');
      video.controls = node.attrs.controls;

      applySize(video, node.attrs);

      const resizeHandle = document.createElement('div');
      resizeHandle.className = 'video-resize-handle';

      wrapper.appendChild(loading);
      wrapper.appendChild(video);
      wrapper.appendChild(resizeHandle);

      const syncVideoState = (attrs) => {
        const hasSrc = !!attrs.src;
        syncCompareState(wrapper, attrs);
        applySize(video, attrs);
        video.controls = attrs.controls !== false;
      
        if (!hasSrc) {
          // loading 态
          loading.style.display = 'flex';
          video.style.display = 'none';
      
          // ⚠️ 清空 src，避免旧视频残留
          if (video.src) {
            video.removeAttribute('src');
            video.load();
          }
        } else {
          // 显示视频
          loading.style.display = 'none';
          video.style.display = 'block';
      
          // video.src becomes an absolute URL in the browser, so compare the raw attribute.
          if (video.getAttribute('src') !== attrs.src) {
            video.setAttribute('src', attrs.src);
          }
        }
      };

      syncVideoState(node.attrs);

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
          node = updatedNode;
          syncVideoState(node.attrs); // 异步请求返回视频地址的时候，需要更新src
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
