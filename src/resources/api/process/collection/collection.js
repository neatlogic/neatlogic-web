import axios from '../../http';

const collection = {
  searchCollection(params) {
    return axios.post('api/rest/process/collection/search', params);
  },
  deleteCollection(id) {
    return axios.post('api/rest/process/collection/delete', {id: id});
  },
  getCollectionById(id) {
    return axios.post('api/rest/process/collection/get', { id: id });
  },
  activeCollection(id) {
    return axios.post('api/rest/process/collection/active', {id: id});
  },
  saveCollection(params) {
    return axios.post('api/rest/process/collection/save', params);
  }
};

export default collection;
