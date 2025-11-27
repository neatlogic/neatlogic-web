export default function hightlightBlock({ editor, pos, options }) {
  const { isToggle } = options || {};
  if (isToggle) {
    editor.chain()
      .focus()
      .toggleHighlightBlock()
      .run();
  } else {
    // 插入高亮块
    editor.chain().focus().setHighlightBlock().run();
  }
}
