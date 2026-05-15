import { Extension } from '@tiptap/core';
import { Plugin } from 'prosemirror-state';
import utils from '@/resources/assets/js/util.js';
import ViewUI from 'neatlogic-ui/iview/index.js';

export const PasteUploadImages = Extension.create({
  name: 'pasteUploadImages',

  addOptions() {
    return {
      upload: null, // 必须传： upload(file: File) => Promise<string> (返回图片的内部 URL)
      uploadExternalImages: true // 是否对外链图片强制二次上传（默认 true）
    };
  },

  addProseMirrorPlugins() {
    const self = this;
    return [
      new Plugin({
        props: {
          handlePaste: (view, event) => {
            const { upload, uploadExternalImages } = self.options;
            if (typeof upload !== 'function') return false;

            const clipboard = event.clipboardData;
            if (!clipboard) return false;

            const html = clipboard.getData('text/html');

            // -----------------------------
            // 1) HTML 中含 <img>（外链或 dataURL）
            // -----------------------------
            if (html && html.includes('<img')) {
              event.preventDefault();

              const div = document.createElement('div');
              div.innerHTML = html;

              const imgsList = Array.from(div.querySelectorAll('img'));

              const tr = view.state.tr;
              imgsList.forEach(img => {
                const uploadId = utils.setUuid();
                const src = img.getAttribute('src') || '';

                const node = view.state.schema.nodes.image.create({ uploadId });
                tr.replaceSelectionWith(node);
                tr.insertText('\n'); // 插入换行符

                // 异步上传
                uploadImage(src, uploadId, view, self);
              });

              view.dispatch(tr.scrollIntoView());
              return true;
            }

            // -----------------------------
            // 2) clipboard items 中有 file（截图等）
            // -----------------------------
            const { state } = view;
            const { schema } = state;
            const items = clipboard.items || [];
            for (let i = 0; i < items.length; i++) {
              const item = items[i];
              const uploadId = utils.setUuid();
              if (item.kind === 'file' && item.type && item.type.startsWith('image/')) {
                event.preventDefault();
                const file = item.getAsFile();
                try {
                  // 添加图片加载中动画
                  const imageNode = schema.nodes.image.create({
                    src: null,
                    uploadId
                  });
                  const tr = state.tr.replaceSelectionWith(imageNode);
                  view.dispatch(tr.scrollIntoView());
                  upload &&
                    typeof upload == 'function' &&
                    upload(file).then(url => {
                      if (url) {
                        const { state } = view;
                        const tr = state.tr;
                        state.doc.descendants((node, pos) => {
                          // 更新图片资源
                          if (node.type.name === 'image' && node.attrs.uploadId === uploadId) {
                            tr.setNodeMarkup(pos, undefined, {
                              ...node.attrs,
                              src: url
                            });
                          }
                        });
                        view.dispatch(tr);
                      }
                    });
                } catch (err) {
                  console.error('上传截图图片失败', err);
                }
                return true;
              }
            }

            return false;
          }
        }
      })
    ];
  }
});

// helper: dataURL -> File
function dataURLToFile(dataurl, filename = `pasted_${Date.now()}.png`) {
  const arr = dataurl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const bstr = atob(arr[1] || '');
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
}

async function uploadImage(src, uploadId, view, self) {
  const { upload, uploadExternalImages } = self.options;

  try {
    let file;

    if (src.startsWith('data:')) {
      file = dataURLToFile(src);
    } else if (/^https?:\/\//.test(src) && uploadExternalImages) {
      const responseData = await fetch(src);
      if (responseData?.status != 200) {
        ViewUI.Message.error('图片获取失败！');
        return false;
      }
      const blob = await responseData.blob();
      file = new File([blob], 'paste.png', { type: blob.type });
    } else {
      return;
    }
    const { state } = view;
    let tr = state.tr;
    if (typeof upload == 'function') {
      upload(file).then((url) => {
        if (url) {
          state.doc.descendants((node, pos) => {
            if (node.type.name === 'image' && node.attrs.uploadId === uploadId) {
              tr = tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                src: url,
                uploadId: null
              });
            }
          });
          if (tr.steps.length) {
            view.dispatch(tr);
          }
        }
      }).catch((err) => {
        ViewUI.Message.error('图片上传失败：' + err);
      });
    }
  } catch (e) {
    console.error('图片上传失败', e);
  }
}

