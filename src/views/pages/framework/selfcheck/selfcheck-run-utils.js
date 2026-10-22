/** 失败步骤同时包含执行错误和独立清理失败，不把中止和跳过误算为失败。 */
export function isFailedItem(item) {
  return item.cleanupStatus === 'FAILED' || (!!item.status && !['SUCCEED', 'SUCCESS', 'PENDING', 'RUNNING', 'ABORTED', 'SKIPPED'].includes(item.status));
}

/** 执行成功且清理未失败的步骤才计入运行中的成功数。 */
export function isSucceededItem(item) {
  return (item.status === 'SUCCEED' || item.status === 'SUCCESS') && item.cleanupStatus !== 'FAILED';
}

/** 终态并已记录结束时间的步骤才算完成，避免清理阶段提前计数。 */
export function isCompletedItem(item) {
  return item.endTime != null && !!item.status && item.status !== 'PENDING' && item.status !== 'RUNNING' && item.cleanupStatus !== 'PENDING' && item.cleanupStatus !== 'RUNNING';
}

/** 尚未手动选择时优先定位失败项，其次运行项及首个返回项。 */
export function getPreferredItem(itemList) {
  return itemList.find(isFailedItem) || itemList.find(item => item.status === 'RUNNING') || itemList[0];
}
