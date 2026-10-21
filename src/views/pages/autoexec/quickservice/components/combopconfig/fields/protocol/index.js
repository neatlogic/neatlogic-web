import { $t } from '@/resources/init.js';

export default {
  key: 'protocol',
  label: $t('page.protocol'),
  group: 'executeAccountForm',
  required: true,
  defaultValue: null,
  visible: context => context.needProtocol,
  getInheritedValue: ({ executeConfig }) => executeConfig.protocolId
};
