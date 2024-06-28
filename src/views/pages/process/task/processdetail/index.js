// 工单详情
import omnipotent from './process-omnipotent';
import automatic from './process-automatic';
import changecreate from './process-changecreate';
import changehandle from './process-changehandle';
import event from './process-event'; //事件
import autoexec from './process-autoexec';
import timer from './process-timer';
import cmdbsync from './process-cmdbsync';
import createjob from './process-createjob';
import FetchComponent from '@/resources/import/fetch-component.js';
export default {
  omnipotent,
  automatic,
  changecreate,
  changehandle,
  event,
  autoexec,
  timer,
  cmdbsync,
  createjob,
  ...FetchComponent.getTaskDetailComponent()
};
