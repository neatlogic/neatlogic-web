//api接口的出口
import { default as dashboardDashboard } from './dashboard/dashboard'; //仪表板
import { default as processProcess } from '../process/process/process'; //流程
import datawarehouse from '../framework/datawarehouse/datawarehouse';//数据仓库

const dashboard = {
  dashboard: dashboardDashboard
};
const process = {
  process: processProcess
};
const framework = {
  datawarehouse
};
/*export default {
  common,
  dashboard,
  process,
  framework
};*/
export default {
  dashboard: dashboardDashboard
};
