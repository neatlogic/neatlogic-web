import axios from '../../http';

const category = {
  searchCategory(params) {
    return axios.post('/api/rest/pbc/category/search', params);
  },
  getCategoryById(id) {
    return axios.post('/api/rest/pbc/category/get', {id: id});
  },
  saveCategory(param) {
    return axios.post('/api/rest/pbc/category/save', param);
  },
  getCategoryByInterfaceId(interfaceId) {
    return axios.post('/api/rest/pbc/category/list', {interfaceId: interfaceId});
  },
  deleteCategoryById(id) {
    return axios.post('/api/rest/pbc/category/delete', {id: id});
  }
};

export default category;
