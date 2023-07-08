import axios from '../../http';

const projecttemplate = {
  searchProjectTemplate(params) {
    return axios.post('/api/rest/rdm/projecttemplate/search', params);
  },
  saveTemplate(params) {
    return axios.post('/api/rest/rdm/projecttemplate/savefromproject', params);
  }
};
export default projecttemplate;
