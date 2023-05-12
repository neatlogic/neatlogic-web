//api接口的出口
import service from './catalog/service'; //服务目录
import form from '../framework/form/form'; //表单管理
import { default as processProcess } from './process/process'; //流程
import priority from './priority/priority'; //优先级
import worktime from './worktime/worktime'; //工作时间窗口
import notice from './notice/notice'; //通知接口
import processtask from './task/task'; //工单接口
import user from '../framework/users/user'; //个人设置
import common from '../common/common'; //全局通用接口
import channeltype from './channeltype/channeltype'; //服务类型
import matrix from '../framework/matrix/matrix'; //矩阵数据源
import tactics from '../framework/notify/tactics'; //策略
import change from './change/change'; //变更
import eventType from './event/eventType'; //事件类型
import eventSolution from './event/eventSolution'; //事件解决方案
import scoreTemplate from './score/scoreTemplate'; //评分模板
import relation from './channeltype/relation'; //工单关联关系
import reply from './reply/reply'; //回复模板
import strategy from './strategy/strategy'; //子策略任务
import integration from './integration/integration'; //集成

//cmdb
import ci from '../cmdb/ci/ci';
import cientity from '../cmdb/cientity/cientity';
import group from '../cmdb/ci/group.js';
 
const cmdb = {
  ci,
  cientity,
  group
};
const framework = {
  user,
  tactics,
  matrix,
  form
};
const process = {
  process: processProcess,
  service,
  priority,
  worktime,
  notice,
  processtask,
  channeltype,
  change,
  eventType,
  eventSolution,
  scoreTemplate,
  relation,
  reply,
  strategy,
  integration
};
/*export default {
  common,
  cmdb,
  framework,
  process
};*/

export default {
  process: processProcess,
  service,
  priority,
  worktime,
  notice,
  processtask,
  channeltype,
  change,
  eventType,
  eventSolution,
  scoreTemplate,
  relation,
  reply,
  strategy,
  integration
};
