import axios from '../../../http';
const tagManage = {
  // 查询资源中心标签
  searchTag(params) {
    return axios.post('api/rest/resourcecenter/tag/search', params);
  },
  // 保存资源中心标签
  saveTag(params) {
    return axios.post('api/rest/resourcecenter/tag/save', params);
  },
  // 删除资源中心标签
  tagManage(id) {
    return axios.post('api/rest/resourcecenter/tag/delete', { id: id });
  },
  // 通过id或名称查询资源中心单个标签信息
  getTag(params) {
    return axios.post('api/rest/resourcecenter/tag/get', params);
  } 
  
};
export default tagManage;
