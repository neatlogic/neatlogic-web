import condition from './condition-node';
import omnipotent from './omnipotent-node';
import automatic from './automatic-node';
import distributary from './distributary-node';
import changecreate from './changecreate-node';
import changehandle from './changehandle-node';
import event from './event-node';
import autoexec from './autoexec-node';
import timer from './timer-node';
//cmdb
import cmdb from '@/views/pages/cmdb/flow/node/index.js';

export default {
  condition,
  omnipotent,
  automatic,
  distributary,
  changecreate,
  changehandle,
  event,
  autoexec,
  ...cmdb,
  timer
};
