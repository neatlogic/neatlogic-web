// 步骤日志
import common from './common.vue';
import automatic from './automatic.vue';
import stepLogCommon from './step-log-common.vue';
import cmdb from '@/views/pages/cmdb/task/processdetail/workorder/taskstep/index.js';
import cmdbsync from './cmdbsync.vue';
import createjob from '@/views/pages/process/task/processdetail/workorder/createjob/job-detail.vue';

import FetchComponent from '@/resources/import/fetch-component.js';
export default {
  common,
  automatic,
  ...cmdb,
  stepLogCommon,
  cmdbsync,
  createjob,
  ...FetchComponent.getStepLogComponent()
};
