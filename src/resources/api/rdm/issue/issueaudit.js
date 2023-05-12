import axios from '../../http';

const issueaudit = {
  searchIssueAudit(params) {
    return axios.post('/api/rest/rdm/issueaudit/search', params);
  }
};
export default issueaudit;
