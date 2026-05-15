import { DOMSerializer, Fragment } from 'prosemirror-model';
import ViewUI from 'neatlogic-ui/iview/index.js';
import { $t } from '@/resources/init.js';

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

  const htmlContent = div.innerHTML;
  const textContent = div.innerText || div.textContent;

  // -------------------------------
  // 4️⃣ 写入剪贴板
  // -------------------------------
  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': new Blob([htmlContent], { type: 'text/html' }),
        'text/plain': new Blob([textContent], { type: 'text/plain' })
      })
    ]);
    ViewUI.Message.success($t('message.copysuccess'));
  } catch (err) {
    console.error('复制失败', err);
    ViewUI.Message.error($t('message.copyfail'));
  }
}
