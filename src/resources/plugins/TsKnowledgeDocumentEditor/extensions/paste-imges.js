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
          handlePaste: async(view, event) => {
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
              await Promise.all(
                imgs.map(async img => {
                  try {
                    let src = img.getAttribute('src') || img.src || '';
                    if (!src) return;

                    // data:image -> 转 file 并上传
                    if (src.startsWith('data:')) {
                      const file = dataURLToFile(src);
                      const newUrl = await upload(file);
                      img.setAttribute('src', newUrl);
                    } else if ((src.startsWith('http://') || src.startsWith('https://')) && uploadExternalImages) {
                      // 外链 http/https -> 如果配置要上传，则 fetch -> upload
                      try {
                        const resp = await fetch(src, { mode: 'cors' });
                        const blob = await resp.blob();
                        // 从 URL 推测扩展名（保底为 png）
                        let ext = 'png';
                        const match = src.split('?')[0].match(/\.(jpeg|jpg|png|gif|webp|svg)$/i);
                        if (match && match[1]) ext = match[1];
                        const file = new File([blob], `external_${Date.now()}.${ext}`, { type: blob.type || `image/${ext}` });
                        const newUrl = await upload(file);
                        img.setAttribute('src', newUrl);
                      } catch (err) {
                        // 如果 fetch/upload 失败，保留原 src（可按需改成删除）
                        console.warn('外链图片下载或上传失败，保留原链接：', src, err);
                      }
                    }
                  } catch (err) {
                    console.error('处理 img 时出错', err);
                  }
                })
              );

              // 将处理过的 div 转为 ProseMirror 的 Slice 并插入（避免重复插入）
              try {
                const parser = ProseMirrorDOMParser.fromSchema(view.state.schema);
                const slice = parser.parseSlice(div);
                const tr = view.state.tr.replaceSelection(slice);
                view.dispatch(tr.scrollIntoView());
              } catch (err) {
                console.error('将 HTML 插入编辑器时出错', err);
              }

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
                  const url = await upload(file);
                  const node = view.state.schema.nodes.image.create({ src: url });
                  const tr = view.state.tr.replaceSelectionWith(node);
                  view.dispatch(tr.scrollIntoView());
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
