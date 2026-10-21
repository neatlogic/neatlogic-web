import { $t } from '@/resources/init.js';

// 分组标题与顺序只在此维护，参数通过 group 声明归属。
export const PARAMETER_GROUPS = [
  { key: 'scenarioForm', title: $t('page.scene') },
  { key: 'roundCountForm', title: $t('term.autoexec.batchsetting') },
  { key: 'runnerGroupTag', title: $t('term.deploy.actuatorgrouptag') },
  { key: 'runnerGroup', title: $t('page.autoexeccomboprunnergrouplabel') },
  { key: 'executeTarget', title: $t('term.autoexec.executetarget') },
  { key: 'executeAccountForm', title: $t('term.autoexec.executeaccount') },
  { key: 'jobParam', title: $t('term.autoexec.jobparam') }
];
