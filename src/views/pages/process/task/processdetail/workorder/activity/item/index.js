import defaultHandler from './default-handler'; 
import priorityHandler from './priority-handler';
import contentHandler from './content-handler';
import formHandler from './form-handler';
import fileHandler from './file-handler';
import restfulactionHandler from './restfulaction-handler';
import workerlistHandler from './workerlist-handler';
import workerHandler from './worker-handler';
import causeHandler from './cause-handler';
import ruleHandler from './rule-handler';
import fromprocesstaskHandler from './fromprocesstask-handler';
import processtasklistHandler from './processtasklist-handler';
import scoreHandler from './score-handler';
import subtaskHandler from './list-handler'; //活动为数组展示
import changeinfoHandler from './list-handler';
import changestepinfoHandler from './list-handler';
import eventinfoHandler from './list-handler';
import focususerHandler from './focususer-handler';

export default {
  defaultHandler, //默认活动展示
  priorityHandler, //优先级
  contentHandler, //描述/描述
  formHandler, //表单
  fileHandler, //附件
  restfulactionHandler, //动作激活
  workerHandler,
  workerlistHandler,
  causeHandler, //条件异常原因
  ruleHandler, //条件规则
  fromprocesstaskHandler, //原工单
  processtasklistHandler, //转报工单
  scoreHandler, //评分
  subtaskHandler, //子任务
  changeinfoHandler, //变更
  changestepinfoHandler, //变更步骤
  eventinfoHandler, //事件
  focususerHandler //修改工单关注人
};
