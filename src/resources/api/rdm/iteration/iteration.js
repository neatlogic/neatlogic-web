import axios from '../../http';

const iteration = {
  getIterationById(id) {
    return axios.post('/api/rest/rdm/iteration/get', {id: id});
  },
  searchIteration(params) {
    return axios.post('/api/rest/rdm/iteration/search', params);
  },
  getIterationApp(id) {
    return axios.post('/api/rest/rdm/iteration/app/list', {id: id});
  },
  saveIteration(params) {
    return axios.post('/api/rest/rdm/iteration/save', params);
  }
};
export default iteration;
