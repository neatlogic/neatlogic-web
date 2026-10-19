import { $t } from '@/resources/init.js';

export default {
  key: 'roundCount',
  label: $t('term.autoexec.batchquantity'),
  group: 'roundCountForm',
  required: true,
  defaultValue: null,
  visible: context => context.needRoundCount && context.values?.parallelPolicy?.value === 'roundCount'
};
