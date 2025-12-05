export default function copy({ editor, position, options }) {
  const { startPosition, endPosition } = position || {};
  editor.chain().focus().setTextSelection({ from: startPosition, to: endPosition }).run();
  // 获取选中文本
  const selectedText = editor.state.doc.textBetween(startPosition, endPosition, '\n');
  // 复制到剪贴板
  if (navigator.clipboard) {
    navigator.clipboard.writeText(selectedText).then(() => {
      console.log('文本复制成功');
    });
  } else {
    // 降级方案
    const textArea = document.createElement('textarea');
    textArea.value = selectedText;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
}
