import axios from '../../http';

const auth = {
  //删除权限里的用户
  deleltAuthUser(data) {
    return axios.post('/api/rest/auth/user/delete', data);
  },
  //删除权限里的角色
  deleltAuthRole(data) {
    return axios.post('/api/rest/auth/role/delete', data);
  },
  //获取角色里面用户的个数
  getUserCount(data) {
    return axios.post('/api/rest/user/countofselecteduserandteam/get', data);
  },
  getAuthList(data) {
    // 获取权限管理列表
    return axios.post('api/rest/auth/manage/search', data);
  }
};

export default auth;
