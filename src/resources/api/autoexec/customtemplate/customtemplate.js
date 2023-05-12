import axios from '../../http';

const customtemplate = {
  searchCustomTemplate(params) {
    return axios.post('/api/rest/autoexec/customtemplate/search', params);
  },
  getCustomTemplateById(id) {
    return axios.post('/api/rest/autoexec/customtemplate/get', {id: id});
  },
  saveCustomTemplate(params) {
    return axios.post('/api/rest/autoexec/customtemplate/save', params);
  },
  deleteCustomTemplate(id) {
    return axios.post('/api/rest/autoexec/customtemplate/delete', {id: id});
  }
};

export default customtemplate;
