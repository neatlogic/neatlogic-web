import axios from '../../http';

const discovery = {
  getDiscoveryConfList() {
    return axios.get('/api/rest/cmdb/discovery/conf/list');
  },
  getDiscoveryConfCombop(confId) {
    return axios.post('/api/rest/cmdb/discovery/combop/get', {confId: confId});
  },
  searchDiscoveryRule(params) {
    return axios.post('/api/rest/cmdb/discovery/rule/search', params);
  },
  saveDiscoveryRule(params) {
    return axios.post('/api/rest/cmdb/discovery/rule/save', params);
  },
  saveDiscoveryConf(params) {
    return axios.post('/api/rest/cmdb/discovery/conf/save', params);
  },
  deleteDiscoveryRule(id) {
    return axios.post('/api/rest/cmdb/discovery/rule/delete', {_id: id});
  },
  deleteDiscoveryConf(_id, id) {
    return axios.post('/api/rest/cmdb/discovery/conf/delete', {_id: _id, id: id});
  },
  createDiscoveryJob(params) {
    return axios.post('/api/rest/cmdb/discovery/job/create', params);
  },
  searchDiscoveryJob(params) {
    return axios.post('/api/rest/cmdb/discovery/job/search', params);
  }
};

export default discovery;
