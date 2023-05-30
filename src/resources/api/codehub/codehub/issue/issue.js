import axios from '@/resources/api/http.js';

const issue = {
  getList(data) { //获取列表
    return axios.post('/api/rest/codehub/issue/search', data);
  },
  aysn(data) {
    return axios.post('/api/rest/codehub/sync', data);
  },
  getSource(data) {
    return axios.post('/api/rest/codehub/sync/source/search', data);
  },
  getSourceconfig(data) {
    return axios.post('/api/rest/codehub/sync/source/param', data);
  },
  getIssueversion(data) {
    return axios.post('/api/rest/codehub/commit/issueversion/search', data);
  }
};
export default issue;
