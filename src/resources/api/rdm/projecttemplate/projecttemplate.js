import axios from '../../http';

const projecttemplate = {
  searchProjectTemplate(params) {
    return axios.post('/api/rest/rdm/projecttemplate/search', params);
  },
  getProjectTemplateById(id) {
    return axios.post('/api/rest/rdm/projecttemplate/get', { id: id });
  },
  saveTemplateFromProject(params) {
    return axios.post('/api/rest/rdm/projecttemplate/savefromproject', params);
  },
  saveProjectTemplate(params) {
    return axios.post('/api/rest/rdm/projecttemplate/save', params);
  },
  deleteProjectTemplate(id) {
    return axios.post('/api/rest/rdm/projecttemplate/delete', { id: id });
  }
};
export default projecttemplate;
