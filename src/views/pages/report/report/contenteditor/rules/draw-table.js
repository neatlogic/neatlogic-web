import {
  buildFunctionSource,
  getBasePreview,
  getDataSourceFormItem,
  getDataSourceMeta,
  joinCommaValue,
  parseJsonConfig,
  splitCommaValue
} from './rule-util';

function getColumnDataList(config, context) {
  const dataSourceMeta = getDataSourceMeta(config.data, context);
  const columnList = dataSourceMeta && Array.isArray(dataSourceMeta.columnList) ? dataSourceMeta.columnList : [];
  return columnList.map(column => ({ value: column, text: column }));
}

function getColumnFormItem(config, context) {
  const dataList = getColumnDataList(config, context);
  const selectedColumnList = splitCommaValue(config.column || config.header);
  if (dataList.length === 0) {
    return {
      type: 'textarea',
      label: '字段',
      value: selectedColumnList.join(','),
      desc: '未识别到字段时可手工输入，多个值用英文逗号分隔'
    };
  }
  selectedColumnList.forEach(column => {
    if (!dataList.find(item => item.value === column)) {
      dataList.unshift({ value: column, text: column });
    }
  });
  return {
    type: 'select',
    label: '字段',
    value: selectedColumnList,
    dataList,
    multiple: true,
    allowCreate: true,
    search: true
  };
}

export default {
  name: 'drawTable',
  label: '表格',
  icon: 'tsfont-table',
  parse(argsText) {
    return Object.assign({
      data: '',
      title: '',
      header: '',
      column: '',
      needPage: false,
      pageSize: 20,
      disableXss: 0
    }, parseJsonConfig(argsText));
  },
  stringify(config) {
    const columnValue = joinCommaValue(config.column || config.header);
    return buildFunctionSource(this.name, Object.assign({}, config, {
      header: columnValue,
      column: columnValue
    }));
  },
  getFormConfig(config, context) {
    return {
      data: getDataSourceFormItem(config, context),
      title: { type: 'text', label: '标题', value: config.title },
      column: getColumnFormItem(config, context),
      needPage: { type: 'switch', label: '分页', value: !!config.needPage },
      pageSize: { type: 'number', label: '每页条数', value: config.pageSize || 20 },
      disableXss: {
        type: 'radio',
        label: '禁用XSS转义',
        value: config.disableXss || 0,
        dataList: [
          { value: 0, text: '否' },
          { value: 1, text: '是' }
        ]
      }
    };
  },
  getPreview(config) {
    return Object.assign(getBasePreview(config, this.label), {
      icon: this.icon,
      summary: [
        config.data ? `data: ${config.data}` : '',
        config.column ? `字段: ${config.column}` : '',
        config.needPage ? `分页: ${config.pageSize || 20}` : ''
      ].filter(Boolean).join(' · ')
    });
  }
};
