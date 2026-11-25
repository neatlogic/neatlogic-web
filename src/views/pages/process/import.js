import { CmdbDispatcherValid } from '@/views/pages/process/flow/flowedit/components/nodesetting/dispatcher/cmdb/valid.js';
import ComponentManager from '@/resources/import/component-manager.js';
ComponentManager.registerDispatcherValidComponent({ CmdbDispatcher: CmdbDispatcherValid });

// 子工单和转报等来源共用工单详情定位方式。
ComponentManager.registerComponent('processTaskReportSourceRoute', {
  processtask: ({ processTaskId, processTaskStepId }) => {
    if (!processTaskId) {
      return '';
    }
    const url = HOME + '/process.html#/task-detail?processTaskId=' + encodeURIComponent(processTaskId);
    return processTaskStepId ? url + '&processTaskStepId=' + encodeURIComponent(processTaskStepId) : url;
  }
});
