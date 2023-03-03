import axios from '../../http';

const audit = {
  // 获取接口树形目录
  getTree(params) {
    return axios.post('/api/rest/apimanage/tree/search', params);
  },
  // 获取接口树形目录子目录
  getSubtree(params) {
    return axios.post('/api/rest/apimanage/subtree/search', params);
  },
  // 获取操作审计的表格数据
  searchAudit(params) {
    return axios.post('/api/rest/apiaudit/search', params);
  },
  // 获取接口的某次调用记录的详情
  getCallDetail(params) {
    return axios.post('/api/rest/apimanage/audit/detail/get', params);
  }
};

export default audit;
