import axios from '../../http';

const catalog = {
  getCatalogById(id) {
    return axios.post('/api/rest/rdm/catalog/get', {id: id});
  },
  searchCatalog(params) {
    return axios.post('/api/rest/rdm/catalog/search', params);
  },
  saveCatalog(params) {
    return axios.post('/api/rest/rdm/catalog/save', params);
  },
  moveCatalog(params) {
    return axios.post('/api/rest/rdm/catalog/move', params);
  },
  deleteCatalog(id) {
    return axios.post('/api/rest/rdm/catalog/delete', {id: id});
  }
};
export default catalog;
