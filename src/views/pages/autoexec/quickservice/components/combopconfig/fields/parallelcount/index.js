import { $t } from '@/resources/init.js';

export default {
  key: 'parallelCount',
  label: $t('term.autoexec.parall'),
  group: 'roundCountForm',
  required: true,
  defaultValue: null,
  visible: context => context.needRoundCount && context.values?.parallelPolicy?.value === 'parallel'
};
