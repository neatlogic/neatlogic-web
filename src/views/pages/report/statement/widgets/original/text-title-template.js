import { $t } from '@/resources/init.js';

export const TEXT_TITLE_TEMPLATE_LIST = [
  { value: 'plain', text: $t('term.report.plaintext') },
  { value: 'glowLine', text: $t('term.report.glowtitle') },
  { value: 'doubleWing', text: $t('term.report.doublewingtitle') },
  { value: 'leftBar', text: $t('term.report.leftbartitle') },
  { value: 'techBlock', text: $t('term.report.techblocktitle') },
  { value: 'bottomBeam', text: $t('term.report.bottombeam') }
];

export function isTitleTemplate(template) {
  return template && template !== 'plain';
}
