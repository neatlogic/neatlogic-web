import { $t } from '@/resources/init.js';

export default {
  handler: 'formtableselector',
  label: $t('term.framework.tableselect'),
  type: 'form',
  category: 'basic',
  icon: 'tsfont-formdynamiclist',
  override_config: {},
  hasValue: true,
  supportTableInputer: true,
  tableInputerConfig: { mode: 'normal', saveData: true, saveMode: 'selected', isRequired: false },
  validTableInputerConfig({ formItem, formItemList = [] }) {
    const config = formItem.config || {};
    const errors = [];
    const add = error => errors.push({ field: 'config', error });
    if (!config.matrixUuid) add($t('form.placeholder.pleaseselect', { target: $t('page.matrix') }));
    if (!(config.dataConfig || []).some(column => !column.isExtra && (column.isPC || column.isMobile))) add($t('form.nestedSelector.displayFieldRequired'));
    if ((config.dataConfig || []).some(column => !column.key)) add($t('form.nestedSelector.fieldKeyRequired'));
    if ((config.dataConfig || []).some(column => ['formtableselector', 'formtableinputer', 'formtable', 'formsubassembly'].includes(column.handler))) add($t('form.nestedSelector.nestedContainerUnsupported'));
    if (config.saveData !== false && !['selected', 'allMatched'].includes(config.saveMode || 'selected')) add($t('form.placeholder.pleaseselect', { target: $t('form.nestedSelector.saveMode') }));
    if ((config.saveData === false || config.saveMode === 'allMatched') && config.mode !== 'normal') add($t('form.nestedSelector.normalModeRequired'));
    for (const rule of formItem.reaction?.filter?.ruleList || []) {
      const uuid = (rule.formItemUuid || '').split('#')[0];
      if (!rule.matrixAttrUuid || uuid === formItem.uuid || !formItemList.some(item => item.uuid === uuid && !['formtableselector', 'formtableinputer', 'formtable'].includes(item.handler))) add($t('form.nestedSelector.filterInvalid'));
    }
    for (const rule of config.sourceColumnList || []) {
      if (!rule.column || !rule.expression || (!['is-null', 'is-not-null'].includes(rule.expression) && !rule.valueList?.length)) add($t('form.nestedSelector.fixedFilterInvalid'));
    }
    return errors;
  },
  excludedFromCondition: true,
  config: {
    disableDefaultValue: true,
    isRequired: false,
    description: '',
    width: '100%',
    isMask: false,
    isHide: false,
    isReadOnly: false,
    isDisabled: false,
    mode: 'dialog',
    dataConfig: [],
    dataSource: 'matrix',
    matrixUuid: '',
    matrixType: '',
    mapping: {},
    pageSize: 10,
    needPage: true,
    isAddData: false, // 自定义矩阵并且是下拉框类型，下拉列表加一个+号按钮
    hideHeaderWhenDataEmpty: true // 数据为空隐藏表头
  },
  reaction: {
    mask: {},
    hide: {},
    display: {},
    readonly: {},
    disable: {},
    filter: {},
    emit: {},
    required: {},
    clearValue: {}
  }
};
