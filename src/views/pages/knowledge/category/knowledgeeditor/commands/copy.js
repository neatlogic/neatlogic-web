import { DOMSerializer, Fragment } from 'prosemirror-model';
import ViewUI from 'neatlogic-ui/iview/index.js';
import { $t } from '@/resources/init.js';

function normalizeResourceUrl(url) {
  if (!url || /^(data:|blob:|mailto:|tel:|#)/i.test(url)) {
    return url;
  }

  if (/^api\//i.test(url)) {
    return url;
  }

  try {
    const parsedUrl = new URL(url, document.baseURI);
    if (parsedUrl.origin !== window.location.origin) {
      return url;
    }

    const apiIndex = parsedUrl.pathname.indexOf('/api/');
    if (apiIndex > -1) {
      return parsedUrl.pathname.slice(apiIndex + 1) + parsedUrl.search + parsedUrl.hash;
    }

    return parsedUrl.pathname.replace(/^\//, '') + parsedUrl.search + parsedUrl.hash;
  } catch (e) {
    return url;
  }
}

function normalizeHtmlResourceUrls(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  div.querySelectorAll('[src]').forEach(el => {
    el.setAttribute('src', normalizeResourceUrl(el.getAttribute('src')));
  });
  div.querySelectorAll('[href]').forEach(el => {
    el.setAttribute('href', normalizeResourceUrl(el.getAttribute('href')));
  });
  return div.innerHTML;
}

function copyByExecCommand({ htmlContent, textContent }) {
  return new Promise((resolve, reject) => {
    const selection = document.getSelection();
    const ranges = [];

    if (selection) {
      for (let i = 0; i < selection.rangeCount; i++) {
        ranges.push(selection.getRangeAt(i));
      }
    }

    const copyTarget = document.createElement('span');
    copyTarget.textContent = textContent || ' ';
    copyTarget.style.cssText = 'position:fixed;left:-9999px;top:0;white-space:pre;';
    document.body.appendChild(copyTarget);

    const handleCopy = event => {
      event.preventDefault();
      event.clipboardData.setData('text/html', htmlContent);
      event.clipboardData.setData('text/plain', textContent || '');
    };

    try {
      document.addEventListener('copy', handleCopy);

      if (selection) {
        const range = document.createRange();
        range.selectNodeContents(copyTarget);
        selection.removeAllRanges();
        selection.addRange(range);
      }

      const isCopied = document.execCommand('copy');
      if (isCopied) {
        resolve();
      } else {
        reject(new Error('document.execCommand copy failed'));
      }
    } catch (e) {
      reject(e);
    } finally {
      document.removeEventListener('copy', handleCopy);
      if (selection) {
        selection.removeAllRanges();
        ranges.forEach(range => selection.addRange(range));
      }
      document.body.removeChild(copyTarget);
    }
  });
}

function copyToClipboard({ htmlContent, textContent }) {
  const canUseClipboardApi = navigator.clipboard && navigator.clipboard.write && window.ClipboardItem;

  if (!canUseClipboardApi) {
    return copyByExecCommand({ htmlContent, textContent });
  }

  return navigator.clipboard.write([
    new ClipboardItem({
      'text/html': new Blob([htmlContent], { type: 'text/html' }),
      'text/plain': new Blob([textContent], { type: 'text/plain' })
    })
  ]).catch(() => copyByExecCommand({ htmlContent, textContent }));
}

/**
 * 复制指定范围的 block（支持嵌套列表/任务列表/blockquote/media）
 * @param {Object} options
 * @param {Editor} options.editor - Tiptap 编辑器实例
 * @param {Object} options.position - { startPosition, endPosition }
 */
export default async function copyBlock({ editor, position }) {
  if (!position) return;

  const { startPosition, endPosition } = position;
  if (startPosition == null || endPosition == null) return;

  const { view } = editor;
  const { state } = view;
  const { doc, schema } = state;

  // 边界检查
  if (
    startPosition < 0 ||
    endPosition > doc.content.size ||
    startPosition >= endPosition
  ) {
    console.warn('copyBlock: startPosition/endPosition 越界或无效');
    return;
  }

  // -------------------------------
  // 1️⃣ 获取 slice
  // -------------------------------
  let slice = doc.slice(startPosition, endPosition);
  let node = slice.content.firstChild;

  // -------------------------------
  // 2️⃣ 递归 wrap 父节点
  // 支持列表/任务列表/blockquote
  // -------------------------------
  const parentTypesToWrap = new Set([
    'bulletList',
    'orderedList',
    'taskList',
    'blockquote'
  ]);

  const $pos = doc.resolve(startPosition);
  let depth = $pos.depth - 1; // 父节点深度

  while (node && depth >= 0) {
    const parent = $pos.node(depth);
    if (parentTypesToWrap.has(parent.type.name)) {
      node = parent.type.create(
        { ...parent.attrs },
        Fragment.from(node),
        []
      );
    }
    depth--;
  }

  slice = { ...slice, content: Fragment.from(node) };

  // -------------------------------
  // 3️⃣ 序列化 DOM（通过 DOMSerializer 保留所有节点属性，包括图片/视频）
  // -------------------------------
  const serializer = DOMSerializer.fromSchema(schema);
  const div = document.createElement('div');

  slice.content.content.forEach(n => {
    const dom = serializer.serializeNode(n);
    div.appendChild(dom);
  });

  const htmlContent = normalizeHtmlResourceUrls(div.innerHTML);
  const textContent = div.innerText || div.textContent || '';

  // -------------------------------
  // 4️⃣ 写入剪贴板
  // -------------------------------
  try {
    await copyToClipboard({ htmlContent, textContent });
    ViewUI.Message.success($t('message.copysuccess'));
  } catch (err) {
    console.error('复制失败', err);
    ViewUI.Message.error($t('message.copyfail'));
  }
}
