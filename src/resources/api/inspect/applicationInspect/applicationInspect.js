import axios from '../../http';

const applicationInspect = {
  getapplicationInspectList(params) {
    // 获取应用巡检列表
    return axios.post('/api/rest/inspect/appmodule/report/search', params);
  },
  getResourceTypeList(params) {
    // 发起应用巡检
    return axios.post('/api/rest/resourcecenter/appmodule/resource/type/list', params);
  },
  getCombopIdByTypeId(params) {
    // 获取组合工具id通过typeId
    return axios.post('/api/rest/inspect/ci/combop/get', params);
  },
  // executeInspect(params) {
  //   // 单个巡检+批量巡检
  //   return axios.post('/api/rest/autoexec/job/from/combop/create', params);
  // },
  createInspectAppJob(params) {
    return axios.post('/api/rest/inspect/app/job/create', params);
  },
  // 获取巡检定时任务
  getSchedule(id) {
    return axios.post('/api/rest/inspect/appsystem/schedule/get', {id: id});
  },
  // 保存巡检定时任务
  saveSchedule(params) {
    return axios.post('/api/rest/inspect/appsystem/schedule/save', params);
  },
  // 巡检定时任务列表
  searchSchedule(params) {
    return axios.post('/api/rest/inspect/appsystem/schedule/search', params);
  },
  updateStatus(params) {
    return axios.post('/api/rest/inspect/appsystem/schedule/status/update', params);
  },
  getInspectionList(params) {
    // 获取批量巡检列表
    return axios.post('/api/rest/inspect/app/env/list', params);
  }
};

export default applicationInspect;
