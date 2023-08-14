import axios from '../../http';

export default {
  searchDashboard(params) {
    return axios.post('/api/rest/rdm/dashboard/search', params);
  },
  getDashboardById(appId, id) {
    return axios.post('/api/rest/rdm/dashboard/get', { appId: appId, id: id });
  },
  saveDashboard(params) {
    return axios.post('/api/rest/rdm/dashboard/save', params);
  },
  deleteDashboard(id) {
    return axios.post('/api/rest/rdm/dashboard/delete', { id: id });
  }
};
