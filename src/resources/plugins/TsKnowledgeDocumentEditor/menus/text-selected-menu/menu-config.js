export const BaseMenuConfigList = [
  { type: 'MenuButton', icon: 'tsfont-bold', title: '加粗', command: 'bold' },
  { type: 'MenuButton', icon: 'tsfont-text-delete', title: '删除线', command: 'strike' },
  { type: 'MenuButton', icon: 'tsfont-italic', title: '倾斜', command: 'italic' },
  { type: 'HyperLink', icon: 'tsfont-attachment', title: '超链接', command: 'link' },
  {
    type: 'ColorDropdown',
    icon: 'tsfont-font-color'
  },
  {
    type: 'TextalignDropdown',
    icon: 'tsfont-horizontal-left'
  }
];
export const TableMenuConfigList = [
  { type: 'MergeCell', icon: '', title: '合并单元格', command: 'mergeOrSplit' },
  { type: 'SplitCell', icon: '', title: '拆分单元格', command: 'mergeOrSplit' }
];
