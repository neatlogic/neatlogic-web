import ComponentManager from '@/resources/import/component-manager.js';

/**
 * 解析批量发布父作业详情；定时作业筛选入口保持原有的自动化详情跳转。
 */
function resolveBatchDeployJobDetail(row, {scheduleId} = {}) {
  if (scheduleId || !row || (row.source !== 'batchdeploy' && row.source !== 'deployschedulepipeline') || row.parentId != -1) {
    return null;
  }
  return HOME + `/deploy.html#/batch-job-detail?id=${row.id}`;
}

ComponentManager.registerComponent('autoexecJobDetailRoute', [resolveBatchDeployJobDetail]);
