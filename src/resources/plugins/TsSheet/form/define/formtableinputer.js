import { $t } from '@/resources/init.js';

export default {
  handler: 'formtableinputer',
  label: $t('term.framework.tableinput'),
  type: 'form',
  category: 'basic',
  icon: 'tsfont-formstaticlist',
  override_config: {},
  hasValue: true,
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
    dataConfig: [],
    isShowNumber: true,
    isCanDrag: true,
    lineNumber: 1,
    isCanAdd: true,
    isShowImportExportBtn: true, // 是否显示导出/导入(模板、表格)选项按钮
    uniqueRuleConfig: [], // 唯一规则配置
    isAddData: false, // 自定义矩阵并且是下拉框类型，下拉列表加一个+号按钮
    isShowHeader: false // 是否显示表头，无数据时不显示表头
  },
  reaction: {
    mask: {},
    hide: {},
    display: {},
    readonly: {},
    disable: {},
    emit: {},
    required: {},
    clearValue: {}
  }
};
