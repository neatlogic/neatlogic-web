export default function imageCrop({ editor, position, options }) {
  const { src } = options || {};
  editor.commands.setImage({
    src: src
  });
}
