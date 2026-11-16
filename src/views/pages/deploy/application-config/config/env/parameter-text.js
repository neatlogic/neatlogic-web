// 文本与表单共用同一份校验规则，错误携带行号供编辑器定位。
export const passwordMask = '••••••••';
export const parameterTypes = ['text', 'password', 'textarea'];

// 参数错误保留物理行号和原始名称，供两种编辑模式定位。
export class ParameterError extends Error {
  // 仅保存定位信息，不将参数值加入错误内容。
  constructor(code, index, key = '') {
    super(code);
    this.code = code;
    this.index = index;
    this.key = key;
  }
}

// 始终校验名称、类型及唯一性，表单提交额外校验未置空项的值。
export function validateParameters(rows, definitions = null, requireValues = true) {
  const keys = new Set();
  return rows.flatMap((row, index) => {
    if (!row.key && !row.value && !row.isEmpty && !row.filledFields?.length && (!row.type || row.type === 'text')) return [];
    const key = String(row.key ?? '');
    if (!key) throw new ParameterError('key', index, key);
    if (keys.has(key)) throw new ParameterError('duplicate', index, key);
    if (!parameterTypes.includes(row.type)) throw new ParameterError('type', index, key);
    if (definitions && !definitions.some(item => item.value === key && item.componentType === row.type)) {
      throw new ParameterError('reference', index, key);
    }
    keys.add(key);
    const isEmpty = row.isEmpty ? 1 : 0;
    if (requireValues && !isEmpty && !String(row.value ?? '').length && !row.filledFields?.includes('value')) {
      throw new ParameterError('value', index, key);
    }
    return [{...row, key, type: row.type, value: isEmpty ? '' : String(row.value ?? ''), isEmpty}];
  });
}

// 特殊名称、特殊值及显式置空使用 JSON 表示，普通行继续兼容旧文本格式。
export function serializeParameters(rows) {
  return rows.map(row => {
    const value = row.isEmpty ? '' : row.type === 'password' && (row.value || row.filledFields?.includes('value'))
      ? passwordMask : String(row.value ?? '');
    const quoted = !!row.isEmpty || /[=:"\\\r\n]|^\s|\s$/.test(row.key) || /[\\\r\n]|^\s|\s$/.test(value);
    const key = quoted ? JSON.stringify(row.key) : row.key;
    const content = quoted ? (row.isEmpty ? 'null' : JSON.stringify(value)) : value;
    return row.type + ': ' + key + ' = ' + content;
  }).join('\n');
}

// 普通名称兼容历史分隔格式，JSON 引号名称可无损保存分隔符、空白和换行。
export function parseParameters(text, previous = [], allowUnsetText = true) {
  const rows = [];
  const lines = String(text).split('\n');
  lines.forEach((line, index) => {
    if (!line.trim()) return;
    const match = /^\s*([^:]+):\s*(.*)$/.exec(line);
    if (!match) throw new ParameterError('format', index);
    const type = match[1].trim();
    const quoted = match[2].startsWith('"');
    const assignment = quoted ? /^("(?:\\.|[^"\\])*")\s*= ?(.*)$/.exec(match[2]) : /^([^=]*?)\s*= ?(.*)$/.exec(match[2]);
    if (!assignment) throw new ParameterError('format', index);
    let key;
    try {
      key = quoted ? JSON.parse(assignment[1]) : assignment[1].trim();
    } catch (error) {
      // JSON 转义错误属于当前文本行的格式错误，不向调用方泄露解析器内部堆栈。
      throw new ParameterError('format', index);
    }
    let value = allowUnsetText ? assignment[2].trim() : assignment[2];
    let isEmpty = 0;
    if (quoted && (value.startsWith('"') || value === 'null')) {
      try {
        // JSON null 表示显式置空，JSON 空字符串及旧格式空值仍表示尚未赋值。
        const decoded = JSON.parse(value);
        isEmpty = decoded === null ? 1 : 0;
        value = decoded === null ? '' : decoded;
      } catch (error) {
        // 非法引号或转义不能作为普通值静默保存。
        throw new ParameterError('format', index, key);
      }
    } else {
      // 老入口只解释换行；接入保留其原有的反斜杠、回车及空白处理规则。
      value = allowUnsetText ? value.replace(/\\n/g, '\n')
        : value.replace(/\\(\\|n|r)/g, (_, escaped) => escaped === 'n' ? '\n' : escaped === 'r' ? '\r' : '\\');
      // 普通空行按所属入口解释，接入沿用显式置空，旧入口保留未赋值状态。
      isEmpty = !allowUnsetText && value === '' ? 1 : 0;
    }
    let row = {key, type, value, isEmpty};
    if (type === 'password' && value === passwordMask) {
      const original = previous.find(item => item.key === key && item.type === type && !item.isEmpty && (item.value || item.filledFields?.includes('value')));
      if (!original) throw new ParameterError('password', index, key);
      row = {...original, key, type};
    }
    // 转换错误中的索引映射回原文本，空白行不改变可定位的行号。
    rows.push({...row, textLine: index});
  });
  try {
    return validateParameters(rows, null, false);
  } catch (error) {
    if (error instanceof ParameterError) error.index = rows[error.index]?.textLine ?? error.index;
    throw error;
  }
}
