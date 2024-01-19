import common from './common.vue'; 
import automatic from './automatic.vue'; 
import stepLogCommon from './step-log-common.vue';
import cmdb from '@/views/pages/cmdb/task/processdetail/workorder/taskstep/index.js';
import cmdbsync from './cmdbsync.vue';
import eoa from './eoa.vue';
export default {
  common,
  automatic,
  ...cmdb,
  stepLogCommon,
  cmdbsync,
  eoa
};
