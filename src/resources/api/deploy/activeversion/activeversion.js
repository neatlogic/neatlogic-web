import axios from '../../http';
const activeversion = {
  searchActiveVersionList(params) { //活动版本
    return axios.post('/api/rest/deploy/activeversion/search', params);
  },
  getHistoryVersionList(params) { //历史版本
    return axios.post('/api/rest/deploy/module/version/audit/list', params);
  }
};
export default activeversion;
