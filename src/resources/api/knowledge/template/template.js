import axios from '../../http';

const template = {
  searchTemplate(params) {
    return axios.post('/api/rest/knowledge/template/search', params);
  },
  getTemplate(params) {
    return axios.post('/api/rest/knowledge/template/get', params);
  },
  saveTemplate(params) {
    return axios.post('/api/rest/knowledge/template/save', params);
  },
  deleteTemplate(params) {
    return axios.post('/api/rest/knowledge/template/delete', params);
  },
  updateStatusTemplate(params) {
    return axios.post('/api/rest/knowledge/template/status/update', params);
  }
};
export default template;
