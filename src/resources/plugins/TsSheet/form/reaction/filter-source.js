// 普通列白名单同时用于配置选项、引用校验和运行时取值，不展开表格容器。
export const filterHandlers = ['formselect', 'formradio', 'formcheckbox', 'formuserselect', 'formdispatchowner', 'formdate', 'formtime', 'formtext', 'formexpression', 'formprocesstaskinfo'];
export const hasFilterValue = value => value !== null && value !== undefined && value !== '';

// 新能力在首次联动求值前关闭查询，避免组件挂载时抢先发出无条件请求。
export function initialFilterReady(item, definitions = []) {
  const filter = item?.reaction?.filter;
  return !filter?.queryWhenConditionHasValue && !(filter?.ruleList || []).some(rule => {
    const uuid = (rule.formItemUuid || '').split('#')[0];
    return definitions.some(source => source.uuid === uuid && source.handler === 'formtableinputer');
  });
}

export function resolveFilterSource(reference, definitions = []) {
  const [uuid, attribute, hidden, ...rest] = (reference || '').split('#');
  const root = definitions.find(item => item.uuid === uuid);
  if (!root || rest.length) return null;
  if (root.handler !== 'formtableinputer') return { root, field: root, attribute: attribute || 'value', table: false };
  const field = (root.config?.dataConfig || []).find(item => item.uuid === attribute && filterHandlers.includes(item.handler));
  if (!field || (hidden && !(field.config?.hiddenFieldList || []).some(item => item.value === hidden))) return null;
  return { root, field, attribute: hidden || 'value', table: true };
}

export function filterReferenceInvalid(reference, definitions, targetUuid) {
  const source = resolveFilterSource(reference, definitions);
  if (!source) return true;
  if (source.root.uuid === targetUuid || source.field.uuid === targetUuid) return true;
  const all = new Map();
  const parents = new Map();
  const visit = (items, parent) => (items || []).forEach(item => {
    all.set(item.uuid, item);
    if (parent) parents.set(item.uuid, parent);
    visit(item.config?.dataConfig, item.uuid);
  });
  visit(definitions);
  let parent = parents.get(targetUuid);
  while (parent) {
    if (parent === source.root.uuid) return true;
    parent = parents.get(parent);
  }
  // 从来源沿既有联动依赖回溯，拒绝新增闭环；不改变其他组件的规则。
  const seen = new Set();
  const dependsOnTarget = uuid => {
    if (uuid === targetUuid) return true;
    if (seen.has(uuid)) return false;
    seen.add(uuid);
    const item = all.get(uuid);
    if (!item) return false;
    return Object.values(item.reaction || {}).some(reaction => (Array.isArray(reaction) ? reaction : [reaction]).some(rule => {
      const refs = [...(rule.ruleList || []).map(r => r.formItemUuid), ...(rule.conditionGroupList || []).flatMap(g => (g.conditionList || []).map(c => c.formItemUuid))];
      return refs.some(ref => {
        const [root, column] = (ref || '').split('#');
        return dependsOnTarget(root) || (all.get(root)?.handler === 'formtableinputer' && column && dependsOnTarget(column));
      });
    }));
  };
  return dependsOnTarget(source.root.uuid) || (source.table && dependsOnTarget(source.field.uuid));
}

export function tableFilterValues(source, rows, convert) {
  const values = new Map();
  (Array.isArray(rows) ? rows : []).forEach(row => {
    const cell = row?.[source.field.uuid];
    (Array.isArray(cell) ? cell : [cell]).forEach(raw => {
      if (!hasFilterValue(raw)) return;
      // 隐藏属性缺失时不回退到默认值。
      if (source.attribute !== 'value' && (typeof raw !== 'object' || !hasFilterValue(raw[source.attribute]))) return;
      const { value, text } = convert(raw, source.attribute, source.field);
      if (!hasFilterValue(value) || !['string', 'number', 'boolean'].includes(typeof value)) return;
      const key = typeof value + ':' + String(value);
      if (!values.has(key)) values.set(key, { value, text: text ?? value });
    });
  });
  // 固定顺序使行排序、重复记录增删不会引发重复查询。
  return [...values.entries()].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([, item]) => item);
}
