import common from './common.vue'; 
import automatic from './automatic.vue'; 
import stepLogCommon from './step-log-common.vue';
import cmdb from '@/views/pages/cmdb/task/processdetail/workorder/taskstep/index.js';
import cmdbsync from './cmdbsync.vue';
import createjob from '@/views/pages/process/task/processdetail/workorder/createjob/job-detail.vue';

let importComponentConfig = {};
try {
  // 导入自定义组件
  const componentConfig = require.context('@/commercial-module', true, /processTaskStepLog.js$/);
  componentConfig
    .keys()
    .forEach(path => {
      importComponentConfig = Object.assign(importComponentConfig, componentConfig(path).default || {});
    });
} catch (error) {
  console.error('form/component/index.js异常', error);
}
export default {
  common,
  automatic,
  ...cmdb,
  stepLogCommon,
  cmdbsync,
  createjob,
  ...importComponentConfig
};
