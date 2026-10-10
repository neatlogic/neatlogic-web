// 统一读取传统 EXPLAIN 字段，兼容驱动返回的字段大小写。
export function readExplainField(row, field) {
  if (!row || typeof row !== 'object' || typeof field !== 'string') return undefined;
  const key = Object.keys(row).find(name => name.toLowerCase() === field.toLowerCase());
  return key === undefined ? undefined : row[key];
}

const readField = readExplainField;

// 空值和数据库返回的 NULL 字符串不作为表名或索引名称。
function meaningfulText(value) {
  if (value === null || value === undefined) return '';
  const text = String(value).trim();
  return /^null$/i.test(text) ? '' : text;
}

// Extra 以分号分隔标记，避免把其他描述中的相似文字误判为优化器标记。
function hasExtra(row, token) {
  return meaningfulText(readField(row, 'Extra')).split(';').some(value => value.trim().toLowerCase() === token.toLowerCase());
}

// UNION 连接只识别完整、简单且无歧义的来源，不从传统 EXPLAIN 推测复杂执行树。
function getUnionGroups(rows) {
  const results = rows.filter(row => meaningfulText(readField(row, 'select_type')).toUpperCase() === 'UNION RESULT');
  if (results.length !== 1) return [];
  const result = results[0];
  const match = /^<union(\d+(?:\s*,\s*\d+)+)>$/i.exec(meaningfulText(readField(result, 'table')));
  if (!match) return [];
  const ids = match[1].split(',').map(value => Number(value.trim()));
  if (ids.some(id => !Number.isSafeInteger(id) || id < 1) || new Set(ids).size !== ids.length) return [];
  const sources = rows.filter(row => row !== result);
  if (sources.length !== ids.length) return [];
  const byId = new Map();
  for (const row of sources) {
    const idText = meaningfulText(readField(row, 'id'));
    const id = Number(idText);
    const selectType = meaningfulText(readField(row, 'select_type')).toUpperCase();
    const table = meaningfulText(readField(row, 'table'));
    if (!/^\d+$/.test(idText) || !ids.includes(id) || byId.has(id) || !['PRIMARY', 'UNION'].includes(selectType) || !table || /^<.*>$/.test(table)) return [];
    byId.set(id, row);
  }
  if (sources.filter(row => meaningfulText(readField(row, 'select_type')).toUpperCase() === 'PRIMARY').length !== 1) return [];
  return [{sources: ids.map(id => byId.get(id)), result}];
}

// 结合表头和行字段识别传统 EXPLAIN；允许序列化省略空字段，未知结构交由原表展示。
export function analyzeExplain(rows, theadList = []) {
  const analysis = {supported: false, accessRows: [], tableNames: [], indexedRows: [], temporaryRows: [], filesortRows: [], fullScanRows: [], unionGroups: []};
  if (!Array.isArray(rows) || !rows.length) return analysis;
  if (!rows.every(row => row && typeof row === 'object' && !Array.isArray(row) && meaningfulText(readField(row, 'select_type')))) return analysis;
  // 核心列描述计划结构；key、rows、Extra 等可空列缺失不影响识别。
  const schema = new Set(rows.flatMap(row => Object.keys(row).map(key => key.toLowerCase())));
  if (Array.isArray(theadList)) {
    theadList.forEach(header => {
      if (header && typeof header.key === 'string') schema.add(header.key.toLowerCase());
    });
  }
  if (!['id', 'select_type', 'table', 'type'].every(field => schema.has(field))) return analysis;
  analysis.supported = true;
  analysis.accessRows = rows.filter(row => {
    const name = meaningfulText(readField(row, 'table'));
    return name && !/^<.*>$/.test(name);
  });
  analysis.tableNames = [...new Set(analysis.accessRows.map(row => meaningfulText(readField(row, 'table'))))];
  analysis.indexedRows = analysis.accessRows.filter(row => meaningfulText(readField(row, 'key')));
  analysis.temporaryRows = rows.filter(row => hasExtra(row, 'Using temporary'));
  analysis.filesortRows = rows.filter(row => hasExtra(row, 'Using filesort'));
  analysis.fullScanRows = analysis.accessRows.filter(row => meaningfulText(readField(row, 'type')).toUpperCase() === 'ALL');
  analysis.unionGroups = getUnionGroups(rows);
  return analysis;
}

// 词法扫描保留引号内容和注释原文；遇到未闭合内容时放弃格式化。
function tokenizeSql(sql) {
  const tokens = [];
  let index = 0;
  while (index < sql.length) {
    const start = index;
    const character = sql[index];
    if (/\s/.test(character)) {
      while (index < sql.length && /\s/.test(sql[index])) index++;
      tokens.push({type: 'space', text: sql.slice(start, index)});
    } else if (character === "'" || character === '"' || character === '`') {
      index++;
      let closed = false;
      while (index < sql.length) {
        if (sql[index] === '\\') {
          index += 2;
        } else if (sql[index] === character) {
          index++;
          if (sql[index] === character) index++;
          else {
            closed = true;
            break;
          }
        } else index++;
      }
      if (!closed) return null;
      tokens.push({type: 'quoted', text: sql.slice(start, index)});
    } else if (character === '#' || (sql.startsWith('--', index) && (index + 2 === sql.length || /\s/.test(sql[index + 2])))) {
      while (index < sql.length && sql[index] !== '\n' && sql[index] !== '\r') index++;
      tokens.push({type: 'lineComment', text: sql.slice(start, index)});
    } else if (sql.startsWith('/*', index)) {
      const end = sql.indexOf('*/', index + 2);
      if (end < 0) return null;
      index = end + 2;
      tokens.push({type: 'comment', text: sql.slice(start, index)});
    } else if (/[a-zA-Z_]/.test(character)) {
      while (index < sql.length && /[a-zA-Z_0-9$]/.test(sql[index])) index++;
      tokens.push({type: 'word', text: sql.slice(start, index)});
    } else {
      index++;
      tokens.push({type: 'symbol', text: character});
    }
  }
  return tokens;
}

// 在原始空白处分行，保留词元及其相邻关系；复制和执行始终使用原始 SQL。
export function formatSqlForDisplay(sql) {
  if (typeof sql !== 'string') return '';
  const tokens = tokenizeSql(sql);
  if (!tokens) return sql;
  const clauses = ['LEFT OUTER JOIN', 'RIGHT OUTER JOIN', 'GROUP BY', 'ORDER BY', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'CROSS JOIN', 'SELECT', 'FROM', 'WHERE', 'HAVING', 'UNION', 'JOIN', 'LIMIT', 'OFFSET'];
  let output = '';
  let depth = 0;
  let previous = null;
  let pendingSpace = false;
  let pendingLine = false;
  let clauseEnd = -1;
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];
    if (token.type === 'space') {
      pendingSpace = true;
      continue;
    }
    let clause = false;
    if (index > clauseEnd && token.type === 'word' && (!previous || previous.text !== '.')) {
      clause = clauses.some(value => {
        let offset = index;
        const words = value.split(' ');
        for (let part = 0; part < words.length; part++) {
          if (!tokens[offset] || tokens[offset].type !== 'word' || tokens[offset].text.toUpperCase() !== words[part]) return false;
          offset++;
          if (part < words.length - 1) {
            if (!tokens[offset] || tokens[offset].type !== 'space') return false;
            offset++;
          }
        }
        if (tokens[offset] && tokens[offset].text === '.') return false;
        clauseEnd = offset - 1;
        return true;
      });
    }
    if (token.text === ')') depth = Math.max(0, depth - 1);
    if (pendingLine || (clause && pendingSpace && output)) output += '\n' + '  '.repeat(depth);
    else if (pendingSpace && output) output += ' ';
    output += token.text;
    pendingSpace = false;
    pendingLine = token.type === 'lineComment';
    if (token.text === '(') depth++;
    previous = token;
  }
  return output;
}
