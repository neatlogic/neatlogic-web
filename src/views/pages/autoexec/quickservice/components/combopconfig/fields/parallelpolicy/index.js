import { $t } from '@/resources/init.js';

export default {
  key: 'parallelPolicy',
  label: $t('page.autoexecparallpolicy'),
  group: 'roundCountForm',
  direct: true,
  required: true,
  defaultValue: 'roundCount',
  visible: context => context.needRoundCount
};
