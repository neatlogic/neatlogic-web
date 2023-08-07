import axios from '../../http';

const integration = {
  //查询集成管理配置
  searchIntegration(params) {
    return axios.post('/api/rest/integration/search', params);
  },
  getIntegrationByUuid(params) {
    return axios.post('/api/rest/integration/get', params);
  },
  getIntegrationHandlerByHandler(params) {
    return axios.post('/api/rest/integration/handler/get', params);
  },
  getIntegrationBodyTypeList(params) {
    return axios.post('/api/rest/integration/bodytype/list', params || {});
  },
  getIntegrationParamListByUuid(params) {
    return axios.post('/api/rest/integration/param/list', params);
  },
  getParamTypeList() {
    return axios.post('/api/rest/integration/paramtype/list', {});
  },
  saveIntegration(params) {
    return axios.post('/api/rest/integration/save', params || {});
  },
  getAuthenticationTypeList(params) {
    return axios.post('/api/rest/integration/authenticationtype/list', params || {});
  },
  runIntegration(uuid, params) {
    return axios.post('/api/rest/integration/run/' + uuid, params || {});
  },
  testIntegration(params) {
    return axios.post('/api/rest/integration/test', params || {});
  },
  testTransform(params) {
    return axios.post('/api/rest/integration/transformtest', params || {});
  },
  toggleIntegrationActive(params) {
    return axios.post('/api/rest/integration/toggleactive', params || {});
  },
  deleteIntegration(params) {
    return axios.post('/api/rest/integration/delete', params || {});
  },
  searchIntegrationAudit(params) {
    return axios.post('/api/rest/integration/audit/search', params);
  },
  //表单：集成数据源
  getIntegrationColumnList(params) {
    return axios.post('/api/rest/integration/table/column/list', params);
  },
  getIntegrationColumnSearch(params) {
    return axios.post('/api/rest/integration/column/data/search', params);
  },
  getIntegrationTableSearch(params) {
    return axios.post('/api/rest/integration/table/data/search', params);
  },
  getStatusList(params) {
    // 集成管理/调用记录/状态列表
    return axios.post('/api/rest/universal/enum/get', params);
  },
  getIntegrationAuditDetail(params) {
    // 查看集成调用记录内容
    return axios.post('/api/rest/integration/audit/detail/get', params);
  }

};

export default integration;
