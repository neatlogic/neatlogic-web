import axios from '../../http';

const app = {
  getAppById(id) {
    return axios.post('/api/rest/rdm/app/get', {id: id});
  },
  searchAppAttr(params) {
    return axios.post('/api/rest/rdm/project/app/attr/search', params);
  }
};
export default app;
