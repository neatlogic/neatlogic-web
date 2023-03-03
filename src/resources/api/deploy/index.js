//api接口的出口
import applicationConfig from './application-config/application-config';
import apppipeline from './application-config/pipeline.js'; //流水线
import version from './version/version'; // 版本中心
import env from './application-config/env'; // 环境
import job from './job/job'; //作业
import pipeline from './pipeline/pipeline.js';
import activeversion from './activeversion/activeversion.js';
import integrated from './application-config/integrated.js'; // 持续集成
import schedule from './schedule/schedule.js'; //定时作业
import webhook from './webhook/webhook'; // 触发器
import toolclassification from './toolclassification/toolclassification'; // 工具分类
export default {
  applicationConfig,
  apppipeline,
  version,
  env,
  job,
  pipeline,
  activeversion,
  schedule,
  integrated,
  webhook,
  toolclassification
};

