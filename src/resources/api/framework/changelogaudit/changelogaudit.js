import axios from '../../http';

const changelogaudit = {
  searchChangelogAuditList(params) {
    return axios.post('/api/rest/changelog/audit/search', params);
  }
};

export default changelogaudit;
