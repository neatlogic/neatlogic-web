import axios from '../../http';

const config = {
  getCorporation(id) {
    return axios.post('/api/rest/pbc/corporation/get', { id: id });
  },
  saveCorporation(params) {
    return axios.post('/api/rest/pbc/corporation/save', params);
  },
  searchCorporation(needItemCount, interfaceId) {
    return axios.post('/api/rest/pbc/corporation/search', { needItemCount: needItemCount, interfaceId: interfaceId });
  },
  deleteCorporation(id) {
    return axios.post('/api/rest/pbc/corporation/delete', { id: id });
  }
};

export default config;
