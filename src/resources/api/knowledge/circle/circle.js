import axios from '../../http';

const circle = {
  searchCircle(params) {
    return axios.post('/api/rest/knowledge/circle/search', params);
  },
  getCircle(params) {
    return axios.post('/api/rest/knowledge/circle/get', params);
  },
  saveCircle(params) {
    return axios.post('/api/rest/knowledge/circle/save', params);
  },
  deleteCircle(params) {
    return axios.post('/api/rest/knowledge/circle/delete', params);
  }
};
export default circle;
