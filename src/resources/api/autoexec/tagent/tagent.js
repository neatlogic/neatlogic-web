import axios from '../../http';
const tagent = {
  //查询页面数据
  serachData(params) {
    return axios.post('/api/rest/runnergroup/search', params);
  },
  //保存代理组
  saveGroup(params) {
    return axios.post('/api/rest/runnergroup/save', params);
  },
  //删除代理组
  deleteGroup(params) {
    return axios.post('/api/rest/runnergroup/delete', params);
  },
  //添加Runner
  saveRunner(params) {
    return axios.post('/api/rest/runner/save', params);
  },
  //删除Runner
  deleteRunner(params) {
    return axios.post('/api/rest/runner/delete', params);
  },
  searchTagent(params) {
    return axios.post('/api/rest/tagent/search', params);
  },
  //删除tagent
  deleteTagents(params) {
    return axios.post('/api/rest/tagent/delete', params);
  },
  //查看密码
  getAccountById(params) {
    return axios.post('api/rest/resourcecenter/account/get', params);
  },
  //获取配置
  getTagentConfig(params) {
    return axios.post('api/rest/tagent/exec/config/get', params);
  },
  //日志列表
  getWorkList(params) {
    return axios.post('api/binary/tagent/exec/log/get', params);
  },
  //保存配置
  saveTagentConfig(params) {
    return axios.post('api/rest/tagent/exec/config/save', params);
  },
  getRunner(params) {
    return axios.post('api/rest/runnergroup/runner/list', params);
  },
  resetPassword(params) {
    return axios.post('api/rest/tagent/exec/password/reset', params);
  },
  restart(params) {
    return axios.post('api/rest/tagent/exec/reload', params);
  }
};
export default tagent;
