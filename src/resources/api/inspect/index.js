//api接口的出口
import assetsInspect from './assetsInspect/assetsInspect.js'; // 资产巡检
import definition from './definition/definition'; // 巡检定义
import inspectJob from './job/job'; // 巡检作业
import applicationInspect from './applicationInspect/applicationInspect.js'; // 应用巡检
import configfile from './configfile/configfile.js';

export default {
  definition,
  assetsInspect,
  inspectJob,
  applicationInspect,
  configfile
};
