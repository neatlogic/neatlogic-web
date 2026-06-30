export function parseJsonConfig(argsText) {
  try {
    const config = JSON.parse(argsText || '{}');
    return config && typeof config === 'object' && !Array.isArray(config) ? config : {};
  } catch (e) {
    return {};
  }
}

export function stringifyJsonConfig(config) {
  const result = {};
  Object.keys(config || {}).forEach(key => {
    const value = config[key];
    if (value === null || typeof value === 'undefined' || value === '') {
      return;
    }
    result[key] = value;
  });
  return JSON.stringify(result);
}

export function buildFunctionSource(name, config) {
  return '${' + name + '(' + stringifyJsonConfig(config) + ')}';
}

function normalizeColumnList(columnList) {
  if (!Array.isArray(columnList)) {
    return [];
  }
  return columnList.filter(column => typeof column === 'string' && column);
}

function addDataSource(dataSourceMap, value, text, columnList) {
  if (!value || dataSourceMap[value]) {
    if (value && dataSourceMap[value] && columnList && columnList.length > 0) {
      dataSourceMap[value].columnList = normalizeColumnList(columnList);
    }
    return;
  }
  dataSourceMap[value] = {
    value,
    text: text && text !== value ? `${text}（${value}）` : value,
    columnList: normalizeColumnList(columnList)
  };
}

function parseSqlGraphConfig(sqlGraphConfig) {
  if (!sqlGraphConfig) {
    return null;
  }
  if (typeof sqlGraphConfig === 'object') {
    return sqlGraphConfig;
  }
  try {
    return JSON.parse(sqlGraphConfig);
  } catch (e) {
    return null;
  }
}

function addGraphDataSource(dataSourceMap, reportData) {
  const sqlGraphConfig = parseSqlGraphConfig(reportData && reportData.sqlGraphConfig);
  const queryList = sqlGraphConfig && sqlGraphConfig.queries;
  if (!Array.isArray(queryList)) {
    return;
  }
  queryList.forEach(query => {
    const columnList = Array.isArray(query && query.fields)
      ? query.fields.map(field => field.property || field.label || field.fieldName || field.name).filter(Boolean)
      : [];
    addDataSource(dataSourceMap, query && query.id, query && query.label, columnList);
  });
}

function addXmlDataSource(dataSourceMap, reportData) {
  const sql = (reportData && reportData.sql) || '';
  const resultMapColumnMap = {};
  const resultMapPattern = /<resultMap\s+[^>]*id=["']([^"']+)["'][^>]*>([\s\S]*?)<\/resultMap>/g;
  let resultMapMatch = null;
  while ((resultMapMatch = resultMapPattern.exec(sql)) !== null) {
    const columnList = [];
    const propertyPattern = /<(?:id|result|collection)\s+[^>]*property=["']([^"']+)["'][^>]*>/g;
    let propertyMatch = null;
    while ((propertyMatch = propertyPattern.exec(resultMapMatch[2])) !== null) {
      columnList.push(propertyMatch[1]);
    }
    resultMapColumnMap[resultMapMatch[1]] = columnList;
  }
  const pattern = /<(select|rest)\s+([^>]*)>/g;
  let match = null;
  while ((match = pattern.exec(sql)) !== null) {
    const attrText = match[2] || '';
    const idMatch = attrText.match(/(?:^|\s)id=["']([^"']+)["']/);
    if (!idMatch) {
      continue;
    }
    const resultMapMatch = attrText.match(/(?:^|\s)resultMap=["']([^"']+)["']/);
    const columnList = resultMapMatch ? resultMapColumnMap[resultMapMatch[1]] : [];
    addDataSource(dataSourceMap, idMatch[1], idMatch[1], columnList);
  }
}

export function getDataSourceList(context = {}) {
  const reportData = context.reportData || {};
  const dataSourceMap = {};
  if (Array.isArray(reportData.tableList)) {
    reportData.tableList.forEach(table => {
      addDataSource(dataSourceMap, table.id || table.data, table.title || table.label || table.name, table.columnList);
    });
  }
  addGraphDataSource(dataSourceMap, reportData);
  if (reportData.sqlEditMode === 'graph') {
    addDataSource(dataSourceMap, 'queryData', '查询数据');
  }
  addXmlDataSource(dataSourceMap, reportData);
  return Object.keys(dataSourceMap).map(key => dataSourceMap[key]);
}

export function getDataSourceMeta(dataName, context = {}) {
  return getDataSourceList(context).find(item => item.value === dataName) || null;
}

export function getDataSourceColumnList(dataName, context = {}) {
  const dataSource = getDataSourceMeta(dataName, context);
  return dataSource && Array.isArray(dataSource.columnList) ? dataSource.columnList : [];
}

export function splitCommaValue(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }
  if (!value) {
    return [];
  }
  return String(value).split(',').map(item => item.trim()).filter(Boolean);
}

export function joinCommaValue(value) {
  return Array.isArray(value) ? value.filter(Boolean).join(',') : value;
}

export function getDataSourceFormItem(config, context = {}, option = {}) {
  const minColumnCount = option.minColumnCount || 0;
  const dataSourceList = getDataSourceList(context);
  const finalDataList = minColumnCount > 0
    ? dataSourceList.filter(item => Array.isArray(item.columnList) && item.columnList.length >= minColumnCount)
    : dataSourceList;
  if (minColumnCount === 0 && config.data && !finalDataList.find(item => item.value === config.data)) {
    finalDataList.unshift({ value: config.data, text: config.data });
  }
  return {
    type: 'select',
    label: '数据源',
    value: config.data,
    dataList: finalDataList,
    allowCreate: minColumnCount === 0,
    search: true,
    desc: finalDataList.length > 0
      ? (minColumnCount > 0 ? '只显示可识别字段的数据源' : '从当前报表数据源中选择，也可手工输入')
      : '未识别到可用数据源'
  };
}

export function getBasePreview(config, fallbackTitle) {
  const title = config.title || fallbackTitle;
  const summaryList = [];
  if (config.data) {
    summaryList.push(`data: ${config.data}`);
  }
  if (config.width || config.height) {
    summaryList.push(`size: ${config.width || '-'} x ${config.height || '-'}`);
  }
  return {
    title,
    summary: summaryList.join(' · ')
  };
}
