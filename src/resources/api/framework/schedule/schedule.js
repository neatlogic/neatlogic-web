import axios from '../../http';

const job = {
  //获取定时作业列表
  search(params) {
    return axios.post('/api/rest/job/search', params);
  },
  //编辑 获取定时作业信息
  get(params) {
    return axios.post('/api/rest/job/get', params);
  },
  //保存
  save(data) {
    return axios.post('/api/rest/job/save', data);
  },
  //删除作业
  delete(params) {
    return axios.post('/api/rest/job/delete', params);
  },
  //查询定时作业组件列表
  classSearch(params) {
    return axios.post('/api/rest/job/class/search', params);
  },
  //定时作业日志列表
  auditSearch(params) {
    return axios.post('/api/rest/job/audit/search', params);
  },
  //查看定时作业日志
  auditLogGet(params) {
    return axios.post('/api/rest/job/audit/log/get', params);
  },
  //获取作业模块组件信息
  classGet(params) {
    return axios.post('/api/rest/job/class/get', params);
  },
  //获取内存的定时作业列表
  searchMemoryJob(params) {
    return axios.post('/api/rest/scheduler/memory/search', params);
  },
  // 查询定时作业来源列表及已有服务器组
  searchJobSource(params) {
    return axios.post('/api/rest/job/source/search', params);
  },
  // 单行或批量修改作业来源服务器组
  updateJobSourceServerGroup(params) {
    return axios.post('/api/rest/job/source/servergroup/update', params);
  },
  //测试定时作业
  test(params) {
    return axios.post('/api/rest/job/test', params);
  }
};
export default job;
