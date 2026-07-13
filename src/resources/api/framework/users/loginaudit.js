import axios from '../../http';
export default {
  
  searchLoginList(params) {
    return axios.post('api/rest/login/audit/list', params);
  },
  searchFeatureList(params) {
    return axios.post('api/rest/feature/search', params);
  },
  searchFeatureUsageAuditList(params) {
    return axios.post('api/rest/feature/usage/audit/search', params);
  }
};
