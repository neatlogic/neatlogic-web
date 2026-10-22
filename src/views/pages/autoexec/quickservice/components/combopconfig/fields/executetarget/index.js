import { $t } from '@/resources/init.js';

export default {
  key: 'executeNodeConfig',
  label: $t('term.autoexec.executetarget'),
  group: 'executeTarget',
  required: true,
  defaultValue: {},
  visible: context => context.needExecuteNode,
  locked: ({ executeConfig }) => executeConfig.whenToSpecify && executeConfig.whenToSpecify !== 'runtime',
  fullWidth: true,
  fullField: true,
  getInheritedValue: ({ executeConfig }) => executeConfig.whenToSpecify === 'runtime' ? {} : executeConfig.executeNodeConfig
};
