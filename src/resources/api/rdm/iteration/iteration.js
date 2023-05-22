import axios from '../../http';

const iteration = {
  getIterationById(id) {
    return axios.post('/api/rest/rdm/iteration/get', {id: id});
  },
  searchIteration(params) {
    return axios.post('/api/rest/rdm/iteration/search', params);
  },
  saveIteration(params) {
    return axios.post('/api/rest/rdm/iteration/save', params);
  },
  toggleIterationIsOpen(params) {
    return axios.post('/api/rest/rdm/iteration/isopen/toggle', params);
  },
  getIterationIssueCount(id) {
    return axios.post('/api/rest/rdm/iteration/issue/count', {id: id});
  }
};
export default iteration;
