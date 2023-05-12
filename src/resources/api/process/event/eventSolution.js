import axios from '../../http';

const eventType = {
  save(params) {
    return axios.post('api/rest/event/solution/save', params);
  },
  search(params) {
    return axios.post('api/rest/event/solution/search', params);
  },
  delete(params) {
    return axios.post('api/rest/event/solution/delete', params);
  },
  get(params) {
    return axios.post('api/rest/event/solution/get', params);
  },
  updateStatus(params) {
    return axios.post('api/rest/event/solution/status/update', params);
  },
  getTree(params) {
    return axios.post('api/rest/event/solution/tree', params);
  }
};

export default eventType;
