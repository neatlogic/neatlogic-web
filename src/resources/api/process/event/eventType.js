import axios from '../../http';

const eventType = {
  getTree(params) {
    return axios.post('api/rest/eventtype/tree', params);
  },
  searchTree(params) {
    return axios.post('api/rest/eventtype/tree/search', params);
  },
  save(params) {
    return axios.post('api/rest/eventtype/save', params);
  },
  move(params) {
    return axios.post('api/rest/eventtype/tree/move', params);
  },
  delete(params) {
    return axios.post('api/rest/eventtype/delete', params);
  },
  getAuth(params) {
    return axios.post('api/rest/eventtype/auth/get', params);
  },
  saveAuth(params) {
    return axios.post('api/rest/eventtype/auth/save', params);
  },
  getSolutionList(params) {
    return axios.post('api/rest/eventtype/solution/list', params);
  }
};

export default eventType;
