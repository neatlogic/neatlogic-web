//api接口的出口
import action from './action/action'; //操作组
import script from './script/script'; //操作组
import job from './job/job'; //作业
import tool from './tool/tool'; //工具库
import operate from './operate/operate'; //操作级别
import tagent from './tagent/tagent'; //tagent
import timeJob from './job/time-job'; // 定时作业接口
import catalog from './tool/catalog'; // 工具目录
import profile from './profile/profile'; // 工具Profile
import scenario from './scene-definition/scene-definition'; // 场景定义
import globalParams from './global-params/global-params'; // 全局参数
import customtemplate from './customtemplate/customtemplate'; // 自定义模板
import catalogManage from './catalog/service'; // 目录管理

export default {
  action,
  script,
  job,
  tool,
  operate,
  tagent,
  timeJob,
  catalog,
  profile,
  scenario,
  globalParams,
  customtemplate,
  catalogManage
};
