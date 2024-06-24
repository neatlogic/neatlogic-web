import condition from './condition-node';
import omnipotent from './omnipotent-node';
import automatic from './automatic-node';
import distributary from './distributary-node';
import changecreate from './changecreate-node';
import changehandle from './changehandle-node';
import event from './event-node';
import autoexec from './autoexec/index.vue';
import timer from './timer-node';
import cmdb from '@/views/pages/cmdb/flow/node/index.js'; //cmdb
import createjob from './createjob';

let importComponentConfig = {};
try {
  // 导入自定义组件
  const componentConfig = require.context('@/commercial-module', true, /flowNode.js$/);
  componentConfig
    .keys()
    .forEach(path => {
      importComponentConfig = Object.assign(importComponentConfig, componentConfig(path).default || {});
    });
} catch (error) {
  console.error('form/component/index.js异常', error);
}
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
  timer,
  createjob,
  ...importComponentConfig
};
