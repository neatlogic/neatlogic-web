// 鼠标经过有内容的 block 时，可以设置边框
export default function blockBorderColor({ editor, position, options }) {
  const { borderColor = '', attrs = {} } = options || {};
  const uuid = attrs?.['data-uuid'];
  const { startPosition } = position || {};
  editor.commands.setBlockStyle({
    uuid: uuid,
    pos: startPosition,
    blockTextColor: '',
    blockBackgroundColor: '',
    blockBorderColor: borderColor
  });
}
