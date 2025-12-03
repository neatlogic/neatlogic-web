export default function deleteRange({ editor, position, options }) {
  const { startPosition, endPosition } = position || {};
  editor.chain()
    .deleteRange({
      from: startPosition,
      to: endPosition
    })
    .run();
}
