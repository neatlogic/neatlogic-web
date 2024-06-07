import omnipotent from './process-omnipotent';
import automatic from './process-automatic';
import changecreate from './process-changecreate';
import changehandle from './process-changehandle';
import event from './process-event'; //事件
import autoexec from './process-autoexec'; 
import timer from './process-timer';
import cmdbsync from './process-cmdbsync';
let importComponentConfig = {};
try {
  // 导入自定义组件
  const componentConfig = require.context('@/commercial-module', true, /processTaskStep.js$/);
  componentConfig
    .keys()
    .forEach(path => {
      importComponentConfig = Object.assign(importComponentConfig, componentConfig(path).default || {});
    });
} catch (error) {
  console.error('form/component/index.js异常', error);
}
export default {
  omnipotent,
  automatic,
  changecreate,
  changehandle,
  event,
  autoexec,
  timer,
  cmdbsync,
  ...importComponentConfig
};
