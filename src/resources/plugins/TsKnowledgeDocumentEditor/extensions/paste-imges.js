import { Extension } from '@tiptap/core';
import { Plugin } from 'prosemirror-state';
import { DOMParser as ProseMirrorDOMParser } from 'prosemirror-model';

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

              const imgs = Array.from(div.querySelectorAll('img'));
              // Promise.all(
              //   imgs.map(async img => {
              //     try {
              //       let src = img.getAttribute('src') || img.src || '';
              //       if (!src) return;

              //       // data:image -> 转 file 并上传
              //       if (src.startsWith('data:')) {
              //         const file = dataURLToFile(src);
              //         const newUrl = await upload(file);
              //         img.setAttribute('src', newUrl);
              //       } else if ((src.startsWith('http://') || src.startsWith('https://')) && uploadExternalImages) {
              //         // 外链 http/https -> 如果配置要上传，则 fetch -> upload
              //         try {
              //           const resp = await fetch(src, { mode: 'cors' });
              //           const blob = await resp.blob();
              //           // 从 URL 推测扩展名（保底为 png）
              //           let ext = 'png';
              //           const match = src.split('?')[0].match(/\.(jpeg|jpg|png|gif|webp|svg)$/i);
              //           if (match && match[1]) ext = match[1];
              //           const file = new File([blob], `external_${Date.now()}.${ext}`, { type: blob.type || `image/${ext}` });
              //           const newUrl = await upload(file);
              //           img.setAttribute('src', newUrl);
              //         } catch (err) {
              //           // 如果 fetch/upload 失败，保留原 src（可按需改成删除）
              //           console.warn('外链图片下载或上传失败，保留原链接：', src, err);
              //         }
              //       }
              //     } catch (err) {
              //       console.error('处理 img 时出错', err);
              //     }
              //   })
              // );

              const tr = view.state.tr;
              imgs.forEach((img) => {
                const uploadId = `img_${Date.now()}_${Math.random()}`;
                const src = img.getAttribute('src') || '';

                const node = view.state.schema.nodes.image.create({ src, uploading: true, uploadId });
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
            const items = clipboard.items || [];
            for (let i = 0; i < items.length; i++) {
              const item = items[i];
              if (item.kind === 'file' && item.type && item.type.startsWith('image/')) {
                event.preventDefault();
                const file = item.getAsFile();
                try {
                  upload && typeof upload == 'function' && upload(file).then((url) => {
                    if (url) {
                      const node = view.state.schema.nodes.image.create({ src: url });
                      const tr = view.state.tr.replaceSelectionWith(node);
                      view.dispatch(tr.scrollIntoView());
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
      const resp = await fetch(src);
      const blob = await resp.blob();
      file = new File([blob], 'paste.png', { type: blob.type });
    } else {
      return;
    }

    const url = await upload(file);
    if (!url) return;

    // 🔑 查找并替换对应 uploadId 的 image node
    const { state } = view;
    let tr = state.tr;

    state.doc.descendants((node, pos) => {
      if (
        node.type.name === 'image' &&
        node.attrs.uploadId === uploadId
      ) {
        tr = tr.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          src: url,
          uploading: false,
          uploadId: null
        });
      }
    });

    if (tr.steps.length) {
      view.dispatch(tr);
    }
  } catch (e) {
    console.error('图片上传失败', e);
  }
}

