import axios from '../../http';

const document = {
  getknowledgeType(data) {
    //获取知识分类列表
    return axios.post('api/rest/knowledge/type/list', data);
  },
  getTree(params) {
    return axios.post('/api/rest/knowledge/document/type/tree', params);
  },
  getSubtree(params) {
    return axios.post('/api/rest/knowledge/document/type/subtree', params);
  },
  getTable(params) {
    return axios.post('/api/rest/knowledge/document/list', params);
  },
  search(params) { //文档搜索
    return axios.post('/api/rest/knowledge/document/search', params);
  },
  deleteDocument(params) {
    return axios.post('/api/rest/knowledge/document/delete', params);
  },
  deleteDraft(params) {
    return axios.post('/api/rest/knowledge/document/version/delete', params);
  },
  toggleCollect(params) {
    return axios.post('/api/rest/knowledge/document/collect/toggle', params);
  },
  searchCondition(params) {
    //获取知识分类的搜索条件
    return axios.post('/api/rest/knowledge/document/condition/get', params);
  },
  searchVersion(data) { //版本搜索
    return axios.post('/api/rest/knowledge/document/version/search', data);
  }
};
export default document;
