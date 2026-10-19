import { $t } from '@/resources/init.js';

export default {
  key: 'executeUser',
  label: $t('page.executeuser'),
  group: 'executeAccountForm',
  required: true,
  defaultValue: '',
  visible: context => context.needExecuteUser
};
