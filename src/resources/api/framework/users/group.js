import axios from '../../http';
const group = {
  //查询角色分组列表
  getGroupList(data) {
    return axios.post('/api/rest/role/team/list', data);
  },
  //查询角色分组架构树形结构
  getGroupTree(data) {
    return axios.post('/api/rest/team/tree', data);
  },
  //保存角色分组
  saveGroupList(data) {
    return axios.post('/api/rest/role/team/save', data);
  },
  //删除角色分组
  delGroupList(data) {
    return axios.post('/api/rest/role/team/delete', data);
  }
};
export default group;

