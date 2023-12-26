import axios from '../../http';

const eoa = {
  searchEoaTemplate(params) {
    return axios.post('/api/rest/eoa/template/search', params);
  },
  getEoaTemplate(params) {
    return axios.post('/api/rest/eoa/template/get', params);
  },
  saveEoaTemplate(params) {
    return axios.post('/api/rest/eoa/template/save', params);
  },
  deleteEoaTemplate(params) {
    return axios.post('/api/rest/eoa/template/delete', params);
  }
};
export default eoa;
