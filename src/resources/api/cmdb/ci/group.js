import axios from '../../http';

const group = {
  getGroupById(id) {
    return axios.post('/api/rest/cmdb/group/get', {id: id});
  },
  saveGroup(params) {
    return axios.post('/api/rest/cmdb/group/save', params);
  },
  execGroup(id, isSync) {
    return axios.post('/api/rest/cmdb/group/exec', {id: id, isSync: isSync});
  },
  deleteGroup(id) {
    return axios.post('/api/rest/cmdb/group/delete', {id: id});
  },
  searchGroup(params) {
    return axios.post('/api/rest/cmdb/group/search', params);
  },
  getCurrentUserActiveGroupByCiId(ciId) {
    return axios.post('/api/rest/cmdb/group/getuseractivegroup', {ciId: ciId});
  }
};

export default group;

