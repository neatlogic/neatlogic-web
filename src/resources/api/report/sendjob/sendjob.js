import axios from '../../http';

const report = {
  search(params) {
    return axios.post('/api/rest/report/sendjob/search', params);
  },
  get(params) {
    return axios.post('/api/rest/report/sendjob/get', params);
  },
  save(params) {
    return axios.post('/api/rest/report/sendjob/save', params);
  },
  delete(params) {
    return axios.post('/api/rest/report/sendjob/delete', params);
  },
  updateStatus(params) {
    return axios.post('/api/rest/report/sendjob/status/update', params);
  },
  // 搜索发送记录
  searchRecord(params) {
    return axios.post('/api/rest/report/sendjob/audit/search', params);
  },
  // 获取定时作业执行记录日志
  getAuditLog(params) {
    return axios.post('/api/rest/job/audit/log/get', params);
  },
  getReportContent({ id, ...params } = {}) {
    return axios.post('/api/binary/report/show/' + id, params);
  }
};

export default report;
