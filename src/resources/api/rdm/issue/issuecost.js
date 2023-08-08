import axios from '../../http';

const issuecost = {
  searchIssueCost(params) {
    return axios.post('/api/rest/rdm/issuecost/search', params);
  },
  getIssueCostById(id) {
    return axios.post('/api/rest/rdm/issuecost/get', { id: id });
  },
  saveIssueCost(params) {
    return axios.post('/api/rest/rdm/issuecost/save', params);
  },
  deleteIssueCost(issueId, id) {
    return axios.post('/api/rest/rdm/issuecost/delete', { issueId: issueId, id: id });
  }
};
export default issuecost;
