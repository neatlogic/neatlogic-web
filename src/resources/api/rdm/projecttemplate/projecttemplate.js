import axios from '../../http';

const projecttemplate = {
  searchProjectTemplate(params) {
    return axios.post('/api/rest/rdm/projecttemplate/search', params);
  }
};
export default projecttemplate;
