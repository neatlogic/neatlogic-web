import axios from '../http';

const common = {
  // 获取所有的权限模块
  getModuleList(params) {
    return axios.post(`/api/rest/auth/module/get`, params);
  },
  // 获取最近使用的仪表板
  updateDashboardMenu(params) {
    return axios.post('/api/rest/dashboard/search', params);
  },
  // 获取知识库的知识分类列表
  updateKnowledgeMenu(params) {
    return axios.get('api/rest/knowledge/type/list', params);
  },
  // 获取报表实例列表
  updateReportMenu(params) {
    return axios.post('/api/rest/reportinstance/search', params);
  },
  // 获取CMDB的模型类型和模型列表
  updateCmdbMenu(params) {
    return axios.post('/api/rest/cmdb/ci/citype/search', params);
  },
  // 获取工单中心分类
  updateProcessMenu(params) {
    return axios.post('/api/rest/workcenter/list', params);
  },
  updateInspectMenu(params) {
    // 获取最新问题分类
    return axios.post('/api/rest/inspect/new/problem/customview/list', params);
  }
};

export default common;
