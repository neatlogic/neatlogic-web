export default function hightlightBlock({ editor, pos, options }) {
  editor.chain().focus().toggleHighlightBlock().run();
}
