export default function link({ editor, pos, options }) {
  const { linkUrl = '' } = options || {};
  editor.chain()
    .focus()
    .extendMarkRange('link')
    .setLink({ href: linkUrl })
    .run();
}
