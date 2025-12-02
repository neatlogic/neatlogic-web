export const BaseMenuConfigList = [
  { type: 'MenuButton', icon: 'tsfont-bold', tipContentList: ['粗体 (Ctrl + B)', 'Markdown：**文本** 空格'], command: 'bold' },
  { type: 'MenuButton', icon: 'tsfont-text-delete', tipContentList: ['删除线 (Ctrl + Shift + S)', 'Markdown：~~文本~~ 空格'], command: 'strike' },
  { type: 'MenuButton', icon: 'tsfont-italic', tipContentList: ['倾斜 (Ctrl + I)', 'Markdown：*文本* 空格'], command: 'italic' },
  { type: 'HyperLink', icon: 'tsfont-attachment', tipContentList: ['超链接'], command: 'link' },
  { type: 'Underline', icon: '', tipContentList: ['下划线'], command: 'underline' },
  { type: 'Code', icon: '', tipContentList: ['代码'], command: 'code' },
  {
    type: 'ColorDropdown',
    icon: 'tsfont-font-color'
  },
  {
    type: 'TextalignDropdown',
    icon: 'tsfont-horizontal-left'
  },
  {
    type: 'TextDropdown',
    icon: 'tsfont-title'
  }
];
export const TableMenuConfigList = [
  { type: 'MergeCell', icon: '', tipContentList: ['合并单元格'], command: 'mergeOrSplit' },
  { type: 'SplitCell', icon: '', tipContentList: ['拆分单元格'], command: 'mergeOrSplit' },
  { type: 'InsertColumnLeft', icon: '', tipContentList: ['左边插入一列'], command: 'addColumnBefore' },
  { type: 'InsertColumnRight', icon: '', tipContentList: ['右边插入一列'], command: 'addColumnAfter' }
];
