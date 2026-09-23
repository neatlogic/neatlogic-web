/**
 * 判断作业是否为应用巡检的壳父作业，子作业继续使用普通作业详情。
 */
export function isApplicationInspectParent(row) {
  return !!row && (row.source === 'inspectapp' || row.source === 'scheduleinspectapp') && row.parentId == -1;
}

/**
 * 为跨模块作业列表提供应用巡检父作业详情地址，未命中时交由调用方处理。
 */
export function resolveApplicationInspectJobDetail(row) {
  return isApplicationInspectParent(row)
    ? HOME + `/inspect.html#/application-inspect-job-detail?id=${row.id}`
    : null;
}
