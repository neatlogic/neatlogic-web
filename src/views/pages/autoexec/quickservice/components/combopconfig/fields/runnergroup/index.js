import { $t } from '@/resources/init.js';
import { isJobEditable } from '../../mapping-rules.js';
import utils from '@/resources/assets/js/util.js';

export default {
  key: 'runnerGroup',
  label: $t('page.autoexeccomboprunnergrouplabel'),
  group: 'runnerGroup',
  required: true,
  defaultValue: '-1',
  // 工具需要指定执行器组，且存在 runner 或 SQL 执行模式时，才显示执行器组参数。
  visible: context => context.needRunnerGroup && context.existRunnerOrSqlExecMode,
  tip: $t('page.autoexeccomboprunnergrouptips'),
  fullWidth: true,
  getJobValue: ({ job, definition, mapping }) => {
    const editable = isJobEditable({ ...definition, locked: false }, mapping);
    return editable ? job[definition.key].value : mapping.value;
  },
  toJobValue: mapping => ({ mappingMode: 'constant', value: utils.deepClone(mapping.value) })
};
