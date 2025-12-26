// 编辑块状菜单，设置整行的背景颜色
export default function blockBackgroundColor({ editor, position, options }) {
  const { backgroundColor = '', attrs = {} } = options || {};
  const uuid = attrs?.['data-uuid'];
  const { startPosition } = position || {};
  editor.commands.setBlockStyle({
    uuid: uuid,
    pos: startPosition,
    blockTextColor: null,
    blockBackgroundColor: backgroundColor
  });
}
