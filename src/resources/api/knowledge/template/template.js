import axios from '../../http';

const template = {
  search(params) {
    return axios.post('/api/rest/knowledge/template/search', params);
  },
  get(params) {
    return axios.post('/api/rest/knowledge/template/get', params);
  },
  save(params) {
    return axios.post('/api/rest/knowledge/template/save', params);
  },
  delete(params) {
    return axios.post('/api/rest/knowledge/template/delete', params);
  },
  updateStatus(params) {
    return axios.post('/api/rest/knowledge/template/status/update', params);
  }
};
export default template;
