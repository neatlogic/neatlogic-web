import axios from '../../http';

const validator = {
  searchValidator(params) {
    return axios.post('/api/rest/cmdb/validator/search', params);
  },
  getValidatorById(id) {
    return axios.post('/api/rest/cmdb/validator/get', {id: id});
  },
  saveValidator(param) {
    return axios.post('/api/rest/cmdb/validator/save', param);
  },
  getFormByValidatorHandler(handler) {
    return axios.post('/api/rest/cmdb/validator/form/get', {handler: handler});
  },
  deleteValidatorById(id) {
    return axios.post('/api/rest/cmdb/validator/delete', {id: id});
  }
};

export default validator;
