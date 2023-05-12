import {$t} from '@/resources/init.js';

export const HANDLERS = [
  {
    name: 'text',
    label: $t('page.input'),
    hasConfig: false
  },
  {
    name: 'timeselect',
    label: $t('page.date'),
    hasConfig: false
  },
  {
    name: 'userselect',
    label: $t('term.framework.userselector'),
    hasConfig: true
  },
  {
    name: 'enumselect',
    label: $t('term.framework.enumselector'),
    hasConfig: true
  }
];
