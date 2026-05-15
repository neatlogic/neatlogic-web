export default function imageAlign({ editor, position, options }) {
  const { align } = options || {};
  editor.commands.alignImage(align || 'left');
}
