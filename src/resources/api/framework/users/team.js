import axios from '../../http';
export default {
  getTeamCount() {
    //获取用户组数量
    return axios.get('/api/rest/team/count');
  },
  getTeamList(data) {
    //获取用户组列表
    return axios.post('/api/rest/team/search', data);
  },
  getTeamTreeList(data) {
    //获取用户组树形列表
    return axios.post('/api/rest/team/tree', data);
  },
  //用户组拖动
  moveTeamList(data) {
    return axios.post('/api/rest/team/tree/move', data);
  },
  saveTeamDetail(data) {
    //保存分组信息
    return axios.post('/api/rest/team/save', data);
  },
  delTeamByUuid(data) {
    //删除分组信息
    return axios.post('/api/rest/team/delete', data);
  },
  getTeam(data) {
    //获取所有分组
    return axios.post('/api/rest/team/list', data);
  },
  searchShowTree(data) {
    //搜索用户组，树形结构
    return axios.post('/api/rest/team/tree/search', data);
  },
  addUserForTeam(data) {
    //给用户组批量添加用户
    return axios.post('/api/rest/team/user/save', data);
  },
  getTeamConfig(data) {
    //分组信息检索
    return axios.post('/api/rest/team/get', data);
  },
  //删除用户组里的用户
  deleltTeamUser(data) {
    return axios.post('/api/rest/team/user/delete', data);
  },
  //通过teamuuidList，获取teamList
  getTeamListByUuid(data) {
    return axios.post('/api/rest/team/get/list', data);
  }
};
