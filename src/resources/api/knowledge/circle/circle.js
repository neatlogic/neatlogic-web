import axios from '../../http';

const circle = {
  search(params) {
    return axios.post('/api/rest/knowledge/circle/search', params);
  },
  get(params) {
    return axios.post('/api/rest/knowledge/circle/get', params);
  },
  save(params) {
    return axios.post('/api/rest/knowledge/circle/save', params);
  },
  delete(params) {
    return axios.post('/api/rest/knowledge/circle/delete', params);
  }
};
export default circle;
