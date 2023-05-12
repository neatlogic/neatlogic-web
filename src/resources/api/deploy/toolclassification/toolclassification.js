import axios from '../../http';
const toolclassification = {
  searchToolClassification(params) {
    // 查询工具分类列表
    return axios.post('/api/rest/deploy/type/search', params);
  },
  updateToolClassificationStatus(params) {
    // 更新工具分类状态
    return axios.post('/api/rest/deploy/type/status/update', params);
  }
};
export default toolclassification;
