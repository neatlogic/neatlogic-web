import axios from '../../http';
const datacenter = {
  getDatacenterList() {
    return axios.post('/api/rest/dr/datacenter/list', {});
  },
  getDatacenterData(params) {
    return axios.post('/api/rest/dr/datacenter/get', params);
  },
  deleteDatacenter(params) {
    return axios.post('/api/rest/dr/datacenter/delete', params);
  },
  saveDatacenter(params) {
    return axios.post('/api/rest/dr/datacenter/save', params);
  }
};
export default datacenter;
