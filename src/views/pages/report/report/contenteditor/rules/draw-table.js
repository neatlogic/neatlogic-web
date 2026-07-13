import {
  buildFunctionSource,
  getBasePreview,
  getDataSourceFormItem,
  getDataSourceMeta,
  joinCommaValue,
  parseJsonConfig,
  splitCommaValue
} from './rule-util';
import { $t } from '@/resources/init.js';

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
      label: $t('page.field'),
      value: selectedColumnList.join(','),
      desc: $t('term.report.fieldmanualinputdesc')
    };
  }
  selectedColumnList.forEach(column => {
    if (!dataList.find(item => item.value === column)) {
      dataList.unshift({ value: column, text: column });
    }
  });
  return {
    type: 'select',
    label: $t('page.field'),
    value: selectedColumnList,
    dataList,
    multiple: true,
    allowCreate: true,
    search: true
  };
}

export default {
  name: 'drawTable',
  label: $t('term.report.table'),
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
      title: { type: 'text', label: $t('page.title'), value: config.title },
      column: getColumnFormItem(config, context),
      needPage: { type: 'switch', label: $t('term.report.pagination'), value: !!config.needPage },
      pageSize: { type: 'number', label: $t('term.report.pagesize'), value: config.pageSize || 20 },
      disableXss: {
        type: 'radio',
        label: $t('term.report.disablexssescape'),
        value: config.disableXss || 0,
        dataList: [
          { value: 0, text: $t('page.no') },
          { value: 1, text: $t('page.yes') }
        ]
      }
    };
  },
  getPreview(config) {
    return Object.assign(getBasePreview(config, this.label), {
      icon: this.icon,
      summary: [
        config.data ? `data: ${config.data}` : '',
        config.column ? `${$t('page.field')}: ${config.column}` : '',
        config.needPage ? `${$t('term.report.pagination')}: ${config.pageSize || 20}` : ''
      ].filter(Boolean).join(' · ')
    });
  }
};
