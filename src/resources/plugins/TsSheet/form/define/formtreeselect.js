import { $t } from '@/resources/init.js';

export default {
  handler: 'formtreeselect',
  label: $t('term.framework.treeselect'),
  type: 'form',
  category: 'basic',
  icon: 'tsfont-topo',
  hasValue: true,
  config: {
    isRequired: false,
    description: '',
    width: '100%',
    isMask: false,
    isHide: false,
    isReadOnly: false,
    isDisabled: false,
    dataSource: 'knowledgeType'
  },
  override_config: {},
  reaction: {
    hide: {},
    display: {},
    readonly: {},
    disable: {},
    required: {},
    clearValue: {}
  }
};
