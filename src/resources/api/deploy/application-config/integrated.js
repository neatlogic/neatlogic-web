import axios from '../../http';
const integrated = {
  getIntegratedList(params) {
    // 持续集成列表
    return axios.post('/api/rest/deploy/ci/search', params);
  },
  delIntegratedById(params) {
    // 删除持续集成
    return axios.post('/api/rest/deploy/ci/delete', params);
  },
  saveConfig(params) {
    // 保存配置
    return axios.post('/api/rest/deploy/ci/save', params);
  },
  getExecuteRecordList(params) {
    // 获取执行记录列表
    return axios.post('/api/rest/deploy/ci/audit/search', params);
  },
  getConfigInfoById(params) {
    // 获取持续集成配置信息通过id
    return axios.post('/api/rest/deploy/ci/get', params);
  },
  getScenarioAndEnvList(params) {
    // 获取应用模块场景和环境列表
    return axios.post('/api/rest/deploy/module/scenarioandenvlist/get', params);
  },
  updateActive(params) {
    // 更新持续集成配置状态
    return axios.post('/api/rest/deploy/ci/activestatus/update', params);
  }
};

export default integrated;
