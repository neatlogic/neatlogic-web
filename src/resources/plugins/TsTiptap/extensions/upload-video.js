import { Node, mergeAttributes } from '@tiptap/core';
const UploadVideo = Node.create({
  name: 'uploadVideo',
  group: 'block',
  atom: true,
  selectable: false,
  addAttributes() {
    return {
      src: { default: null },
      controls: { default: true },
      width: { default: '100%' },
      loading: {
        default: false,
        renderHTML: attrs => (attrs.loading ? { 'data-loading': 'true' } : {})
      },
      uuid: {
        default: null,
        parseHTML: (element) => element.getAttribute('uuid'),
        renderHTML: (attributes) => ({ 'uuid': attributes.uuid })
      }
    };
  },
  parseHTML() {
    return [{ tag: 'video' }];
  },
  renderHTML({ HTMLAttributes }) {
    const { src, width, controls, loading } = HTMLAttributes;
    // 1️⃣ 加载中状态
    if (loading || !src) {
      return [
        'div',
        mergeAttributes(HTMLAttributes, {
          'data-type': 'upload-video',
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
      'video',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'upload-video',
        src,
        width,
        controls
      }),
      0
    ];
  },
  addCommands() {
    return {
      insertVideo: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: {
            ...options
          }
        });
      },
      updateVideo: (uuid, newAttrs) => ({ tr, state }) => {
        tr.doc.descendants((node, pos) => { // 遍历文档中的所有节点
          if (node.type.name === this.name && node.attrs.uuid === uuid) {
            tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...newAttrs });
          }
        });
      }
    };
  }
});

export default UploadVideo;
