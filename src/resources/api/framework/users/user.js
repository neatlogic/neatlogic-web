import axios from '../../http';
export default {
  //查询用户信息Api
  searchUser(data) {
    return axios.post('/api/rest/user/search', data);
  },
  //新用户查询接口，用于查询角色成员列表等
  newSearchUser(data) {
    return axios.post('/api/rest/role/user/list', data);
  },
  //变更用户有效性
  updateActive(data) {
    return axios.post('/api/rest/user/active', data);
  },
  //根据用户Id查询用户信息Api
  getUser(data) {
    return axios.post('/api/rest/user/get', data);
  },
  //删除用户Api
  deleteUser(data) {
    return axios.post('/api/rest/user/delete', data);
  },
  //保存用户信息Api
  saveUser(data) {
    return axios.post('/api/rest/user/save', data);
  },
  //保存用户信息Api
  saveCurrentUser(data) {
    return axios.post('/api/rest/user/current/save', data);
  },
  uploadAvatar(formData) {
    return fetch(BASEURLPREFIX + '/api/binary/user/avatar/upload', {
      method: 'post',
      credentials: 'same-origin',
      body: formData
    }).then(res => res.json());
    // return axios.post('/api/binary/user/avatar/upload', data, {
    //   headers: { 'Content-Type': 'multipart/form-data' }
    // });
  },
  //修改密码
  updatePwd(data) {
    return axios.post('/api/rest/user/password/update', data);
  },
  getUserListByIds(data) {
    //批量获取用户信息
    return axios.post('/api/rest/user/get/list', data);
  },
  //用户个性化查询接口
  getProfile(data) {
    return axios.post('/api/rest/user/profile/list', data);
  },
  //用户个性化保存接口
  saveProfile(data) {
    return axios.post('/api/rest/user/profile/save', data);
  },
  //保存默认模块和模块默认页
  saveDefaultPage(data) {
    return axios.post('/api/rest/user/data/save', data);
  },
  //获取用户授权代理
  getAgent(data) {
    return axios.post('/api/rest/user/agent/get', data);
  },
  //保存用户授权代理
  saveAgent(data) {
    return axios.post('/api/rest/user/agent/save', data);
  },
  //删除用户授权代理
  deleteAgent(data) {
    return axios.post('/api/rest/user/agent/delete', data);
  },
  //用户授权
  // /api/rest/processtask/agent/save
  saveProcesstask(data) {
    return axios.post('/api/rest/processtask/agent/save', data);
  },
  getProcesstask(data) {
    return axios.post('/api/rest/processtask/agent/get', data);
  },
  deleteProcesstask() {
    return axios.post('/api/rest/processtask/agent/delete');
  },
  updateProcesstask() {
    return axios.post('/api/rest/processtask/agent/isactive/update');
  },
  resetCurrentUserToken() {
    return axios.post('/api/rest/user/current/token/reset', {});
  },
  resetUserToken(data) {
    return axios.post('/api/rest/user/token/reset', data);
  },
  getUserSetting(data) { //获取用户个性化设置
    return axios.post('/api/rest/user/data/get', data);
  },
  deleteUserSetting(data) { //删除用户个性化设置
    return axios.post('/api/rest/user/data/delete', data);
  }
};
