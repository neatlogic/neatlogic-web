// 提供参数转换、记录映射、分页加载和提交过滤；不持有 Vue 状态，异步结果由父表决定是否回写。
export const isNestedSelector = column => column.handler === 'formtableselector';
const validRecordUuid = value => (typeof value === 'string' && value.trim().length > 0) || (typeof value === 'number' && Number.isFinite(value));

// 仅将查询和记录映射相关配置纳入标识，标签、宽度等展示配置不触发完整重载。
export function queryIdentity(config, filter) {
  return JSON.stringify({ matrixUuid: config.matrixUuid, saveData: config.saveData !== false, saveMode: config.saveMode || 'selected',
    sourceColumnList: config.sourceColumnList || [], filter,
    columns: (config.dataConfig || []).map(column => ({ uuid: column.uuid, matrixAttrUuid: column.matrixAttrUuid, isExtra: column.isExtra,
      handler: column.handler, defaultValue: column.config?.defaultValue, defaultValueType: column.config?.defaultValueType,
      defaultValueField: column.config?.defaultValueField, defaultTextField: column.config?.defaultTextField })) });
}

// 参数和响应均复制，避免接口处理或字段映射污染调用方的数据。
export async function loadMatrixPage(request, params, signal) {
  const response = await request(JSON.parse(JSON.stringify(params)), { signal });
  if (signal.aborted) throw Object.assign(new Error('Cancelled'), { name: 'AbortError' });
  if (response?.Status !== 'OK' || !Array.isArray(response.Return?.tbodyList)) throw new Error('Matrix query failed');
  return JSON.parse(JSON.stringify(response));
}

export function matrixParams(config, filter) {
  const columns = (config.dataConfig || []).filter(column => !column.isExtra);
  return {
    matrixUuid: config.matrixUuid,
    columnList: columns.map(column => column.matrixAttrUuid || column.uuid),
    searchColumnList: [],
    filterList: [
      ...filter,
      ...(config.sourceColumnList || []).map(item => ({ uuid: item.column, expression: item.expression, valueList: item.valueList || [] }))
    ],
    currentPage: 1,
    pageSize: config.pageSize || 10
  };
}

export function mapMatrixRows(rows, config) {
  return rows.map(source => {
    // 与原独立选择器一致，优先使用 text；兼容仅提供 value 或直接返回标识的响应。
    // 保留标识原类型，不随机生成或强制转成字符串，避免改变历史记录的匹配关系。
    const row = { uuid: source.uuid?.text ?? source.uuid?.value ?? source.uuid };
    if (!validRecordUuid(row.uuid)) throw new Error('Matrix record has an invalid unique identifier');
    for (const column of config.dataConfig || []) {
      const cell = source[column.matrixAttrUuid || column.uuid];
      if (!column.isExtra) row[column.uuid] = cell && typeof cell === 'object' ? cell.text : cell;
    }
    for (const column of (config.dataConfig || []).filter(item => item.isExtra)) {
      const settings = column.config || {};
      const selection = ['formselect', 'formradio', 'formcheckbox'].includes(column.handler);
      let value = settings.defaultValue ?? null;
      if (settings.defaultValueType === 'matrix') {
        value = selection ? { value: row[settings.defaultValueField] || '', text: row[settings.defaultTextField] || '' } : row[settings.defaultValue];
      } else if (selection && value != null && typeof value !== 'object') {
        value = { value, text: value };
      } else if (selection && Array.isArray(value)) {
        value = value.map(item => typeof item === 'object' ? item : { value: item, text: item });
      }
      row[column.uuid] = value == null ? null : JSON.parse(JSON.stringify(value));
    }
    return row;
  });
}

// 全量保存由后端关闭分页，一次返回全部匹配记录；前端展示分页不影响保存范围。
export async function loadAllMatched(request, config, filter, signal) {
  if (signal.aborted) return null;
  const params = matrixParams(config, filter);
  params.needPage = false;
  delete params.currentPage;
  delete params.pageSize;
  let response;
  try {
    response = await loadMatrixPage(request, params, signal);
  } catch (error) {
    if (signal.aborted) return null;
    throw error;
  }
  if (signal.aborted) return null;
  const records = new Map();
  mapMatrixRows(response.Return.tbodyList, config).forEach(row => records.set(row.uuid, row));
  return [...records.values()];
}

// 剔除历史遗留的不保存列时创建行副本，不删除编辑对象上的字段；无须剔除时保留原引用。
export function persistedTableRows(rows, columns) {
  const excluded = columns.filter(column => isNestedSelector(column) && column.config?.saveData === false);
  if (!excluded.length) return rows;
  return rows.map(row => {
    const result = { ...row };
    excluded.forEach(column => { delete result[column.uuid]; });
    return result;
  });
}
