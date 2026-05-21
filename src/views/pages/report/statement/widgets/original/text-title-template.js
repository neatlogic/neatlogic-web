export const TEXT_TITLE_TEMPLATE_LIST = [
  { value: 'plain', text: '普通文本' },
  { value: 'glowLine', text: '流光标题' },
  { value: 'doubleWing', text: '双翼标题' },
  { value: 'leftBar', text: '侧标标题' },
  { value: 'techBlock', text: '科技块标题' },
  { value: 'bottomBeam', text: '底部光束' }
];

export function isTitleTemplate(template) {
  return template && template !== 'plain';
}
