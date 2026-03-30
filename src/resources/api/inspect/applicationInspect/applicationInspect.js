import axios from '../../http';

const applicationInspect = {
  getapplicationInspectList(params) {
    // 获取应用巡检列表
    return axios.post('/api/rest/inspect/appmodule/report/search', params);
  },
  getNewapplicationInspectList(params) {
    // 获取新的应用巡检列表
    return axios.post('/api/rest/inspect/app/resource/list', params);
  },
  getInspectAppModuleEnvList(params) {
    // 发起应用巡检
    return axios.post('/api/rest/inspect/appmodule/env/list', params);
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
  },
  searchConfigBaseline(params) {
    return axios.post('/api/rest/inspect/config/baseline/search', params);
  },
  getConfigAiSetting(params) {
    return axios.post('/api/rest/inspect/config/ai/setting/get', params);
  },
  saveConfigAiSetting(params) {
    return axios.post('/api/rest/inspect/config/ai/setting/save', params);
  },
  getConfigSnapshot(params) {
    return axios.post('/api/rest/inspect/config/snapshot/get', params);
  },
  searchConfigSnapshot(params) {
    return axios.post('/api/rest/inspect/config/snapshot/search', params);
  },
  getConfigBaselineVersion(params) {
    return axios.post('/api/rest/inspect/config/baseline/version/get', params);
  },
  searchConfigBaselineVersion(params) {
    return axios.post('/api/rest/inspect/config/baseline/version/search', params);
  },
  saveConfigBaselineVersion(params) {
    return axios.post('/api/rest/inspect/config/baseline/version/save', params);
  },
  saveConfigBaselineVersionFromSnapshot(params) {
    return axios.post('/api/rest/inspect/config/baseline/version/snapshot/save', params);
  },
  saveConfigBaselineVersionDraft(params) {
    return axios.post('/api/rest/inspect/config/baseline/version/draft/save', params);
  },
  submitConfigBaselineVersion(params) {
    return axios.post('/api/rest/inspect/config/baseline/version/submit', params);
  },
  auditConfigBaselineVersion(params) {
    return axios.post('/api/rest/inspect/config/baseline/version/audit', params);
  },
  publishConfigBaselineVersion(params) {
    return axios.post('/api/rest/inspect/config/baseline/version/publish', params);
  },
  rollbackConfigBaselineVersion(params) {
    return axios.post('/api/rest/inspect/config/baseline/version/rollback', params);
  },
  deleteConfigBaselineVersion(params) {
    return axios.post('/api/rest/inspect/config/baseline/version/delete', params);
  },
  deleteConfigBaseline(params) {
    return axios.post('/api/rest/inspect/config/baseline/delete', params);
  },
  compareConfigBaseline(params) {
    return axios.post('/api/rest/inspect/config/baseline/compare', params);
  },
  compareConfigSnapshot(params) {
    return axios.post('/api/rest/inspect/config/snapshot/compare', params);
  },
  compareConfigResource(params) {
    return axios.post('/api/rest/inspect/config/resource/compare', params);
  }
};

export default applicationInspect;
