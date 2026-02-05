// 鼠标经过有内容的 block 时，可以设置字体颜色
export default function blockTextColor({ editor, position, options }) {
  const { fontColor = '', attrs = {} } = options || {};
  const uuid = attrs?.blockUuid;
  const { startPosition } = position || {};
  editor.commands.setBlockStyle({
    uuid: uuid,
    pos: startPosition,
    blockTextColor: fontColor,
    blockBackgroundColor: ''
  });
}
