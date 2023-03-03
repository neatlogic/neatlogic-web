import axios from '../../http';
const runner = {
  //查询页面数据
  getRunner(params) {
    return axios.post('/api/rest/runner/search', params);
  },
  //添加Runner
  saveRunner(params) {
    return axios.post('/api/rest/runner/save', params);
  },
  //删除Runner
  deleteRunner(id) {
    return axios.post('/api/rest/runner/delete', {id: id});
  },
  getRunnerGroup(params) {
    // 查询runner组列表
    return axios.post('/api/rest/runnergroup/search', params);
  },
  // 分组
  saveRunnerGroup(params) {
    // 保存runner组
    return axios.post('/api/rest/runnergroup/save', params);
  },
  delRunnerGroup(id) {
    // 删除runner组
    return axios.post('/api/rest/runnergroup/delete', {id: id});
  },
  delRunnerGroupRunner(id) {
    // 删除runner组里面的runner
    return axios.post('/api/rest/runnergroup/runner/delete', {id: id});
  }
};
export default runner;
