import axios from '../../http';

const legalvalid = {
  searchLegalValid(params) {
    return axios.post('/api/rest/cmdb/legalvalid/search', params);
  },
  getLegalValidById(id) {
    return axios.post('/api/rest/cmdb/legalvalid/get', {id: id});
  },
  saveLegalValid(params) {
    return axios.post('/api/rest/cmdb/legalvalid/save', params);
  },
  deleteLegalValid(id) {
    return axios.post('/api/rest/cmdb/legalvalid/delete', {id: id});
  }
};

export default legalvalid;
