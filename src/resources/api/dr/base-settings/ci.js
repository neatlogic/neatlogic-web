import axios from '../../http';
const ci = {
  getCiList() {
    return axios.post('/api/rest/dr/ci/list', {});
  },
  getCiData(params) {
    return axios.post('/api/rest/dr/ci/get', params);
  },
  saveCi(params) {
    return axios.post('/api/rest/dr/ci/save', params);
  }
};
export default ci;
