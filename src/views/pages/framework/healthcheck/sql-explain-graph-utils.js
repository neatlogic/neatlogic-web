import {analyzeExplain, readExplainField} from './sql-explain-utils.js';

const OPERATORS = {
  ordering_operation: 'sort',
  grouping_operation: 'group',
  duplicates_removal: 'distinct',
  union_result: 'union'
};
const SUBQUERIES = new Set(['attached_subqueries', 'select_list_subqueries', 'optimized_away_subqueries']);
const METADATA = new Set([
  'cost_info', 'used_columns', 'possible_keys', 'used_key_parts', 'ref', 'partitions',
  'attached_condition', 'having_condition', 'condition', 'message', 'select_id',
  'table_name', 'access_type', 'key', 'key_length', 'rows_examined_per_scan',
  'rows_produced_per_join', 'filtered', 'using_index', 'using_temporary_table',
  'using_filesort', 'using_join_buffer', 'dependent', 'cacheable', 'optimized_away',
  'using_mrr', 'using_index_for_group_by', 'index_condition', 'using_where',
  'first_match', 'loosescan', 'not_exists', 'rematerialize', 'update', 'delete',
  'recursive', 'union_all'
]);

// 保留优化器原值，空字段由展示组件统一显示占位符。
function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// 节点标记仅由数据库明确提供的属性生成，不从访问方式推测耗时或连接算法。
function jsonFlags(raw) {
  const flags = [];
  if (raw.using_index === true) flags.push('Using index');
  if (raw.using_temporary_table === true) flags.push('Using temporary');
  if (raw.using_filesort === true) flags.push('Using filesort');
  if (raw.using_mrr === true) flags.push('Using MRR');
  if (raw.using_index_for_group_by === true) flags.push('Using index for group-by');
  if (raw.using_join_buffer) flags.push('Using join buffer (' + raw.using_join_buffer + ')');
  return flags;
}

// 传统计划只连明确、无歧义的 UNION 分支；同 id 的 JOIN 行保持独立。
function traditionalGraph(rows, theadList) {
  const analysis = analyzeExplain(rows, theadList);
  const graph = {nodes: [], edges: [], source: 'none', hasUnknown: false};
  if (!analysis.supported) return graph;
  graph.source = 'traditional';
  graph.nodes = rows.map((row, index) => ({
    id: '$.rows[' + index + ']',
    kind: String(readExplainField(row, 'select_type')).toUpperCase() === 'UNION RESULT' ? 'union' : (readExplainField(row, 'table') ? 'table' : 'query'),
    title: readExplainField(row, 'table') ? readExplainField(row, 'select_type') : readExplainField(row, 'Extra'),
    table: readExplainField(row, 'table'),
    accessType: readExplainField(row, 'type'),
    index: readExplainField(row, 'key'),
    rows: readExplainField(row, 'rows'),
    filtered: readExplainField(row, 'filtered'),
    queryBlockId: readExplainField(row, 'id'),
    flags: String(readExplainField(row, 'Extra') || '').split(';').map(value => value.trim()).filter(Boolean),
    raw: row
  }));
  analysis.unionGroups.forEach(group => {
    const target = '$.rows[' + rows.indexOf(group.result) + ']';
    group.sources.forEach(row => {
      const source = '$.rows[' + rows.indexOf(row) + ']';
      graph.edges.push({id: source + '->' + target, source, target, dashed: false});
    });
  });
  return graph;
}

// 从 JSON 路径生成稳定节点 ID；输入子树保持只读，供节点原始数据查看。
export function buildExplainGraph(planJson, rows = [], theadList = []) {
  if (!isObject(planJson) || !Object.keys(planJson).length) return traditionalGraph(rows, theadList);
  const graph = {nodes: [], edges: [], source: 'json', hasUnknown: false};

  // 所有节点共用展示契约，访问字段缺失时不补造零值或索引名称。
  function addNode(id, kind, title, raw, queryBlockId) {
    const node = {
      id, kind, title, raw, queryBlockId,
      table: raw.table_name,
      accessType: raw.access_type,
      index: raw.key,
      rows: raw.rows_examined_per_scan,
      filtered: raw.filtered,
      flags: jsonFlags(raw)
    };
    graph.nodes.push(node);
    if (kind === 'unknown') graph.hasUnknown = true;
    return id;
  }

  // 实线表示计划输入，虚线单独表示子查询或物化数据依赖。
  function connect(sources, target, dashed = false) {
    sources.forEach(source => {
      if (source === target) return;
      const id = source + '->' + target;
      if (!graph.edges.some(edge => edge.id === id)) graph.edges.push({id, source, target, dashed});
    });
  }

  // 未识别的结构保留通用节点，继续展示其中明确的子计划。
  function unknown(value, path, title, queryBlockId) {
    const raw = isObject(value) ? value : {value};
    const id = addNode(path, 'unknown', title, raw, queryBlockId);
    const children = parseContent(raw, path, queryBlockId, id);
    connect(children, id);
    return [id];
  }

  // 子查询用单独节点保留 dependent、cacheable 等原始属性，不混入主查询连接顺序。
  function dependency(value, path, title, queryBlockId, kind = 'subquery') {
    const raw = isObject(value) ? value : {value};
    const id = addNode(path, kind, title, raw, queryBlockId);
    connect(parseContent(raw, path, queryBlockId, id), id);
    return id;
  }

  // 以 nested_loop 数组顺序逐级组合输入，仅称为连接，不推测 LEFT/HASH 等算法。
  function nestedLoop(value, path, queryBlockId) {
    if (!Array.isArray(value)) return unknown(value, path, 'nested_loop', queryBlockId);
    let previous = [];
    value.forEach((entry, index) => {
      const entryPath = path + '[' + index + ']';
      const current = parse(entry, entryPath, queryBlockId);
      if (!previous.length) {
        previous = current;
      } else if (current.length) {
        const id = addNode(entryPath + '#join', 'join', 'nested_loop', isObject(entry) ? entry : {value: entry}, queryBlockId);
        connect(previous, id);
        connect(current, id);
        previous = [id];
      }
    });
    if (!previous.length) previous = [addNode(path, 'join', 'nested_loop', {nested_loop: value}, queryBlockId)];
    return previous;
  }

  // 保留 UNION 的每个查询分支，分组、排序和去重等包装节点在输入之后输出。
  function operator(value, path, key, queryBlockId) {
    if (!isObject(value)) return unknown(value, path, key, queryBlockId);
    const id = addNode(path, OPERATORS[key], key, value, queryBlockId);
    connect(parseContent(value, path, queryBlockId, id), id);
    return [id];
  }

  // 表访问的物化来源和表达式子查询接到本表，用虚线区别于主计划输入。
  function table(value, path, queryBlockId) {
    if (!isObject(value)) return unknown(value, path, 'table', queryBlockId);
    const id = addNode(path, 'table', value.table_name, value, queryBlockId);
    const inputs = parseContent(value, path, queryBlockId, id);
    connect(inputs, id);
    return [id];
  }

  // 结构字段显式处理；cost_info、索引列等元数据只在原始数据中保留。
  function parseContent(raw, path, queryBlockId, owner) {
    const roots = [];
    const dependencies = [];
    Object.keys(raw).forEach(key => {
      const value = raw[key];
      const childPath = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? path + '.' + key : path + '[' + JSON.stringify(key) + ']';
      if (key === 'query_block') roots.push(...parse(value, childPath, queryBlockId));
      else if (key === 'table') roots.push(...table(value, childPath, queryBlockId));
      else if (key === 'nested_loop') roots.push(...nestedLoop(value, childPath, queryBlockId));
      else if (Object.prototype.hasOwnProperty.call(OPERATORS, key)) roots.push(...operator(value, childPath, key, queryBlockId));
      else if (key === 'query_specifications') {
        if (Array.isArray(value)) value.forEach((entry, index) => roots.push(...parse(entry, childPath + '[' + index + ']', queryBlockId)));
        else roots.push(...unknown(value, childPath, key, queryBlockId));
      } else if (key === 'materialized_from_subquery') {
        dependencies.push(dependency(value, childPath, key, queryBlockId, 'materialize'));
      } else if (SUBQUERIES.has(key)) {
        const entries = Array.isArray(value) ? value : [value];
        entries.forEach((entry, index) => dependencies.push(dependency(entry, childPath + '[' + index + ']', key, queryBlockId)));
      } else if (!METADATA.has(key) && (isObject(value) || Array.isArray(value))) {
        if (Array.isArray(value)) {
          const id = addNode(childPath, 'unknown', key, {value}, queryBlockId);
          graph.hasUnknown = true;
          value.forEach((entry, index) => {
            if (isObject(entry)) connect(parse(entry, childPath + '[' + index + ']', queryBlockId), id);
          });
          roots.push(id);
        } else roots.push(...unknown(value, childPath, key, queryBlockId));
      }
    });
    // 存在主输入时，依赖指向当前输入的输出；仅有依赖的无表块交给查询块节点挂接。
    if (owner) dependencies.forEach(id => connect([id], owner, true));
    else if (roots.length) dependencies.forEach(id => roots.forEach(root => connect([id], root, true)));
    else if (dependencies.length) {
      const id = addNode(path + '#query', 'query', raw.message || 'query_block', raw, queryBlockId);
      dependencies.forEach(dependencyId => connect([dependencyId], id, true));
      roots.push(id);
    }
    return roots;
  }

  // 空表计划以查询块保留优化器 message；未知结构不会降级为虚构表访问。
  function parse(raw, path, parentBlockId) {
    if (!isObject(raw)) return unknown(raw, path, 'query_block', parentBlockId);
    const blockId = raw.select_id === undefined ? parentBlockId : raw.select_id;
    const roots = parseContent(raw, path, blockId);
    if (roots.length) return roots;
    return [addNode(path, 'query', raw.message || 'query_block', raw, blockId)];
  }

  parse(planJson, '$', undefined);
  return graph;
}
