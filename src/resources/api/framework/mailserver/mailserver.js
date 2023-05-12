import axios from '../../http';

const mailserver = {
  search(data) {
    return axios.post('/api/rest/mailserver/search', data);
  },
  get(data) {
    return axios.post('/api/rest/mailserver/get', data);
  },
  save(data) {
    return axios.post('/api/rest/mailserver/save', data);
  },
  active(data) {
    return axios.post('/api/rest/mailserver/status/update', data);
  },
  delete(data) {
    return axios.post('/api/rest/mailserver/delete', data);
  },
  test(data) {
    return axios.post('/api/rest/mailserver/test', data);
  }
};
export default mailserver;
