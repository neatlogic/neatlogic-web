export default function cut({ editor, position, options }) {
  const { startPosition, endPosition, node } = position || {};
  editor.commands.deleteRange({ from: startPosition, to: endPosition });
  navigator.clipboard.writeText(node?.textContent);
}
