//时间线
import defaultHandler from './default-handler';
import titleHandler from './title-handler';
import buttonHandler from './button-handler'; // 子任务完成时点击的按钮使用纯文本明细组件。
import priorityHandler from './priority-handler';
import contentHandler from './content-handler';
import replyopinionHandler from './replyopinion-handler'; // 回复意见复用富文本明细布局，直接显示已保存的内容。
import formHandler from './form-handler';
import fileHandler from './file-handler';
import restfulactionHandler from './restfulaction-handler';
import workerlistHandler from './workerlist-handler';
import assignworkerlistHandler from './assignworkerlist-handler';
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
import automaticinfoHandler from './automaticinfo-handler';
import cmdbsyncmessageHandler from './cmdbsyncmessage-handler';
import autoexecmessageHandler from './autoexecmessage-handler';
import ComponentManager from '@/resources/import/component-manager.js';

export default {
  defaultHandler, //默认活动展示
  titleHandler,
  buttonHandler, // 展示当次操作保存的按钮名称。
  priorityHandler, //优先级
  contentHandler, //描述/描述
  replyopinionHandler, // 子任务完成时保存的回复意见，避免再次拼接操作名称。
  formHandler, //表单
  fileHandler, //附件
  restfulactionHandler, //动作激活
  workerHandler,
  workerlistHandler,
  assignworkerlistHandler,
  causeHandler, //条件异常原因
  ruleHandler, //条件规则
  fromprocesstaskHandler, //原工单
  processtasklistHandler, //转报工单
  scoreHandler, //评分
  subtaskHandler, //子任务
  changeinfoHandler, //变更
  changestepinfoHandler, //变更步骤
  eventinfoHandler, //事件
  focususerHandler, //修改工单关注人
  automaticinfoHandler,
  cmdbsyncmessageHandler,
  autoexecmessageHandler,
  ...(ComponentManager.getTimeLineComponent() || {})
};
