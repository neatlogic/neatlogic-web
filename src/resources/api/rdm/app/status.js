import axios from '../../http';

const status = {
  getStatusById(id) {
    return axios.post('/api/rest/rdm/status/get', { id: id });
  },
  saveStatus(params) {
    return axios.post('/api/rest/rdm/status/save', params);
  },
  getStatusByAppId(appId, params) {
    const p = {appId: appId};
    if (params) {
      Object.assign(p, params);
    }
    return axios.post('/api/rest/rdm/status/list', p);
  },
  toggleStatusRel(params) {
    return axios.post('/api/rest/rdm/statusrel/toggle', params);
  },
  saveStatusRelConfig(params) {
    return axios.post('/api/rest/rdm/statusrel/config/save', params);
  },
  changeStatusType(params) {
    return axios.post('/api/rest/rdm/statustype/update', params);
  },
  getStatusRel(params) {
    return axios.post('/api/rest/rdm/statusrel/get', params);
  },
  getStatusRelByAppId(appId) {
    return axios.post('/api/rest/rdm/statusrel/list', { appId: appId });
  },
  deleteStatus(id) {
    return axios.post('/api/rest/rdm/status/delete', {id: id});
  }
};
export default status;
