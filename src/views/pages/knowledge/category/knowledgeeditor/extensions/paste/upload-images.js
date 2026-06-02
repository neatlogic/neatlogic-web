import { Extension } from '@tiptap/core';
import { Plugin } from 'prosemirror-state';
import utils from '@/resources/assets/js/util.js';
import ViewUI from 'neatlogic-ui/iview/index.js';

export const PasteUploadImages = Extension.create({
  name: 'pasteUploadImages',

  addOptions() {
    return {
      upload: null
    };
  },

  addProseMirrorPlugins() {
    const self = this;
    return [
      new Plugin({
        props: {
          handlePaste: (view, event) => {
            const { upload } = self.options;
            if (typeof upload !== 'function') return false;

            const clipboard = event.clipboardData;
            if (!clipboard) return false;

            const { state } = view;
            const { schema } = state;
            const items = clipboard.items || [];
            const html = clipboard.getData('text/html');

            for (let i = 0; i < items.length; i++) {
              const item = items[i];
              const uploadId = utils.setUuid();
              if (item.kind === 'file' && item.type && item.type.startsWith('image/')) {
                event.preventDefault();
                const file = item.getAsFile();
                try {
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

            if (hasExternalImage(html)) {
              ViewUI.Message.warning('外联图片不支持上传');
            }

            return false;
          }
        }
      })
    ];
  }
});

function hasExternalImage(html) {
  if (!html || !html.includes('<img')) {
    return false;
  }

  const div = document.createElement('div');
  div.innerHTML = html;
  return Array.from(div.querySelectorAll('img')).some(img => isExternalImageUrl(img.getAttribute('src') || ''));
}

function isExternalImageUrl(url) {
  if (!url || /^(data:|blob:|api\/)/i.test(url)) {
    return false;
  }

  try {
    const parsedUrl = new URL(url, document.baseURI);
    if (!/^https?:$/i.test(parsedUrl.protocol)) {
      return false;
    }

    if (parsedUrl.origin === window.location.origin && parsedUrl.pathname.includes('/api/')) {
      return false;
    }

    return parsedUrl.origin !== window.location.origin;
  } catch (e) {
    return false;
  }
}
